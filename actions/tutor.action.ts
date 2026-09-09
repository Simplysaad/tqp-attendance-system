"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Tutor, { timeToMinutes } from "@/models/tutor.model";
import Schedule, { DayOfWeek, ScheduleMode, IScheduleDocument, ISchedule } from "@/models/schedule.model";
import { getSession } from "./user.action";
import Student from "@/models/student.model";



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

export interface UpdateScheduleInput {
    scheduleId: string;
    dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    startTime: number; // in minutes
    endTime: number;   // in minutes
    googleMeetLink?: string;
    mode?: "online" | "onsite";
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


export async function updateSchedule(data: UpdateScheduleInput) {
    const session = await getSession();

    if (!session) {
        return { success: false, error: "Unauthorized" };
    }

    if (!data.scheduleId) {
        return { success: false, error: "Schedule ID is required" };
    }

    await connectDB();

    // 1. Fetch current schedule to verify existence
    const existingSchedule = await Schedule.findById(data.scheduleId);
    if (!existingSchedule) {
        return { success: false, error: "Schedule not found" };
    }

    // 2. Identify and authorize tutor ownership
    let targetTutorId = existingSchedule.tutor.toString();

    if (session.role === "tutor") {
        const tutor = await Tutor.findOne({ user: session.id });
        if (!tutor || tutor._id.toString() !== targetTutorId) {
            return { success: false, error: "Unauthorized to modify this schedule" };
        }
    }

    // 3. Prevent Overlapping Slots (excluding the current schedule document)
    const existingOverlap = await Schedule.findOne({
        _id: { $ne: data.scheduleId },
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
            error: `Schedule overlaps with another existing slot on ${data.dayOfWeek}.`,
        };
    }

    // 4. Perform Update
    const updatedSchedule = await Schedule.findByIdAndUpdate(
        data.scheduleId,
        {
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            mode: data.mode || existingSchedule.mode || "online",
            googleMeetLink: data.googleMeetLink ?? existingSchedule.googleMeetLink,
            maxCapacity: data.maxCapacity ?? existingSchedule.maxCapacity ?? 1,
        },
        { new: true }
    );

    revalidatePath("/dashboard");
    return { success: true, schedule: JSON.parse(JSON.stringify(updatedSchedule)) };
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

export async function getNearestSchedule(): Promise<
    { success: true; data: IScheduleDocument } | { success: false; error: string }
> {
    const authSession = await getSession();

    if (!authSession) {
        return { success: false, error: "Unauthorized access" };
    }

    await connectDB();

    let schedules: IScheduleDocument[] = [];

    if (authSession.role === "tutor") {
        // 1. Fetch Tutor Profile
        const tutor = await Tutor.findOne({ user: authSession.id }).lean();
        if (!tutor) {
            return { success: false, error: "Tutor profile not found" };
        }

        // 2. Fetch all schedules for this tutor with populated tutor->user details
        schedules = await Schedule.find({ tutor: tutor._id })
            .populate({
                path: "tutor",
                populate: { path: "user", select: "name email" },
            })
            .lean<IScheduleDocument[]>();
    } else {
        // 3. Fetch Student Profile first to get the Student _id
        const student = await Student.findOne({ user: authSession.id || authSession.userId }).lean();
        if (!student) {
            return { success: false, error: "Student profile not found" };
        }

        // 4. Fetch schedules matching the Student _id
        schedules = await Schedule.find({ students: student._id })
            .populate({
                path: "tutor",
                populate: { path: "user", select: "name email" },
            })
            .lean<IScheduleDocument[]>();
    }

    if (!schedules || schedules.length === 0) {
        return { success: false, error: "No class schedules found." };
    }

    // 5. Determine current time context
    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let nearestSchedule: IScheduleDocument | null = null;
    let smallestDiff = Infinity;

    for (const schedule of schedules) {
        const scheduleDayIndex = DAYS_ORDER.indexOf(
            schedule.dayOfWeek.toLowerCase() as DayOfWeek
        );
        if (scheduleDayIndex === -1) continue;

        let dayDiff = (scheduleDayIndex - currentDayIndex + 7) % 7;

        // If today, but the schedule has already ended, push it to next week
        if (dayDiff === 0 && schedule.endTime < currentMinutes) {
            dayDiff = 7;
        }

        let timeDiffInMinutes: number;
        if (dayDiff === 0) {
            // Class is either active or starting later today
            if (currentMinutes >= schedule.startTime && currentMinutes <= schedule.endTime) {
                timeDiffInMinutes = 0; // Active right now -> Highest priority
            } else {
                timeDiffInMinutes = schedule.startTime - currentMinutes;
            }
        } else {
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

    return { success: true, data: JSON.parse(JSON.stringify(nearestSchedule)) };
}

export async function activateNearestSchedule() {
    const result = await getNearestSchedule();

    if (!result.success) {
        return { success: false, error: result.error };
    }

    const nearestSchedule = result.data;

    // 5. Toggle Schedule status directly in DB
    const newStatus = nearestSchedule.status === "active" ? "inactive" : "active";
    const updatedSchedule = await Schedule.findByIdAndUpdate(
        nearestSchedule._id,
        { status: newStatus },
        { new: true } // Returns the updated document
    );

    revalidatePath("/dashboard");

    const isActive = newStatus === "active";
    return {
        success: true,
        isActive,
        scheduleDay: nearestSchedule.dayOfWeek,
        message: isActive
            ? `Activated schedule for ${nearestSchedule.dayOfWeek}`
            : `Deactivated schedule for ${nearestSchedule.dayOfWeek}`,
    };
}