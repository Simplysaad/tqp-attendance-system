"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Tutor, { timeToMinutes } from "@/models/tutor.model";
import Schedule, { DayOfWeek, ScheduleMode, IScheduleDocument } from "@/models/schedule.model";
import Session from "@/models/session.model";
import { getSession } from "./user.action";



export interface AvailabilityInput {
    dayOfWeek: DayOfWeek;
    startTimeStr: string; // Expected "HH:MM" e.g., "09:00"
    endTimeStr: string;   // Expected "HH:MM" e.g., "17:00"
}

export interface CompleteTutorOnboardingInput {
    userId: string;
    gender: "male" | "female";
    maximumStudents?: number;
    availability: AvailabilityInput[];
}


interface CreateScheduleInput {
    tutorId?: string; // Optional if coordinator creates it for a tutor
    dayOfWeek: DayOfWeek;
    startTime: number; // Minutes from midnight (e.g., 600 = 10:00 AM)
    endTime: number;   // Minutes from midnight (e.g., 660 = 11:00 AM)
    mode: ScheduleMode;
    googleMeetLink?: string;
    maxCapacity?: number;
}


export async function completeTutorOnboarding(data: CompleteTutorOnboardingInput) {
    try {
        await connectDB();

        // Convert string userId to ObjectId
        const currentUser = await getSession()

        const { id: userId } = currentUser;

        // Cast userId string to ObjectId for clean Mongoose querying
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const existingTutor = await Tutor.findOne({ user: userObjectId });
        if (existingTutor) {
            return { success: false, message: "Tutor profile already exists for this user." };
        }

        // Convert string times ("HH:MM") to minute values (0 - 1439) required by schema
        const formattedAvailability = data.availability.map((item) => {
            const startTime = timeToMinutes(item.startTimeStr);
            const endTime = timeToMinutes(item.endTimeStr);

            return {
                dayOfWeek: item.dayOfWeek.toLowerCase() as DayOfWeek,
                startTime,
                endTime,
                isActive: true,
            };
        });

        const newTutor = await Tutor.create({
            user: userObjectId,
            gender: data.gender,
            maximumStudents: data.maximumStudents ? Number(data.maximumStudents) : 5,
            availability: formattedAvailability,
            isActive: true,
        });

        console.log("newTutor", newTutor.populate("user"))

        revalidatePath("/dashboard");
        return { success: true, tutorId: newTutor._id.toString() };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to create tutor profile." };
    }
}


export async function createSchedule(data: CreateScheduleInput) {
    const session = await getSession();

    if (!session) {
        return { success: false, error: "Unauthorized" };
    }

    await connectDB();

    // Identify the target tutor
    let targetTutorId = data.tutorId;

    if (session.role === "tutor") {
        const tutor = await Tutor.findOne({ user: session.id });
        if (!tutor) return { success: false, error: "Tutor profile not found" };
        targetTutorId = tutor._id.toString();
    }

    if (!targetTutorId) {
        return { success: false, error: "Tutor ID is required" };
    }

    // 1. Prevent Overlapping Slots for the Same Tutor on the Same Day
    const existingOverlap = await Schedule.findOne({
        tutor: targetTutorId,
        dayOfWeek: data.dayOfWeek,
        status: "active",
        $or: [
            { startTime: { $lt: data.endTime, $gte: data.startTime } },
            { endTime: { $gt: data.startTime, $lte: data.endTime } },
            { startTime: { $lte: data.startTime }, endTime: { $gte: data.endTime } },
        ],
    });

    if (existingOverlap) {
        return {
            success: false,
            error: `You already have an active schedule overlapping with this time on ${data.dayOfWeek}.`,
        };
    }

    // 2. Create and Save Schedule
    const newSchedule = await Schedule.create({
        tutor: targetTutorId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        mode: data.mode || "online",
        googleMeetLink: data.googleMeetLink,
        maxCapacity: data.maxCapacity || 1,
        status: "active",
    });

    revalidatePath("/dashboard");
    return { success: true, schedule: JSON.parse(JSON.stringify(newSchedule)) };
}


const DAYS_ORDER: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

export async function activateNearestSchedule() {
    const authSession = await getSession();

    if (!authSession || authSession.role !== "tutor") {
        return { success: false, error: "Unauthorized access" };
    }

    await connectDB();

    // 1. Fetch Tutor Profile
    const tutor = await Tutor.findOne({ user: authSession.id });
    if (!tutor) {
        return { success: false, error: "Tutor profile not found" };
    }

    // 2. Fetch all active schedules for this tutor
    const schedules = await Schedule.find({
        tutor: tutor._id,
        status: "active",
    }).lean<IScheduleDocument[]>();

    if (!schedules || schedules.length === 0) {
        return { success: false, error: "No active class schedules found." };
    }

    // 3. Determine current time context
    const now = new Date();
    const currentDayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 4. Find the nearest schedule (Currently running OR next in future)
    let nearestSchedule: IScheduleDocument | null = null;
    let smallestDiff = Infinity;

    for (const schedule of schedules) {
        const scheduleDayIndex = DAYS_ORDER.indexOf(
            schedule.dayOfWeek.toLowerCase() as DayOfWeek
        );
        if (scheduleDayIndex === -1) continue;

        // Calculate days away from today (0 to 6)
        let dayDiff = (scheduleDayIndex - currentDayIndex + 7) % 7;

        // If it's today, check if it already ended
        if (dayDiff === 0 && schedule.endTime < currentMinutes) {
            // Slot passed earlier today, push target to next week (7 days away)
            dayDiff = 7;
        }

        // Convert total time difference to total minutes from now
        let timeDiffInMinutes: number;
        if (dayDiff === 0) {
            // Happening today (either currently running or later today)
            timeDiffInMinutes = Math.max(0, schedule.startTime - currentMinutes);
        } else {
            // Happening on a future day
            timeDiffInMinutes = dayDiff * 1440 + (schedule.startTime - currentMinutes);
        }

        if (timeDiffInMinutes < smallestDiff) {
            smallestDiff = timeDiffInMinutes;
            nearestSchedule = schedule;
        }
    }

    if (!nearestSchedule) {
        return { success: false, error: "Could not find a valid upcoming schedule." };
    }

    // 5. Define normalized "today" start date (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 6. Check existing session for today
    const existingSessions = await Session.find({
        schedule: nearestSchedule._id,
        date: today,
    });

    const nextActiveState =
        existingSessions.length > 0 ? !existingSessions[0].isLinkActive : true;

    if (existingSessions.length > 0) {
        await Session.updateMany(
            { schedule: nearestSchedule._id, date: today },
            { $set: { isLinkActive: nextActiveState } }
        );
    } else if (nearestSchedule.students && nearestSchedule.students.length > 0) {
        const sessionDocs = nearestSchedule.students.map((studentId: any) => ({
            schedule: nearestSchedule!._id,
            student: studentId,
            tutor: tutor._id,
            date: today,
            startTime: nearestSchedule!.startTime,
            endTime: nearestSchedule!.endTime,
            attendance: "absent",
            isLinkActive: true,
        }));

        await Session.insertMany(sessionDocs);
    } else {
        return {
            success: false,
            error: `Nearest schedule (${nearestSchedule.dayOfWeek}) has no assigned students yet.`,
        };
    }

    revalidatePath("/dashboard");
    return {
        success: true,
        isActive: nextActiveState,
        scheduleDay: nearestSchedule.dayOfWeek,
        message: nextActiveState
            ? `Activated nearest schedule (${nearestSchedule.dayOfWeek})`
            : `Deactivated schedule (${nearestSchedule.dayOfWeek})`,
    };
}