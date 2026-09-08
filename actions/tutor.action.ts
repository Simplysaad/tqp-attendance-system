"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Tutor, { timeToMinutes } from "@/models/tutor.model";
import Schedule, { DayOfWeek, ScheduleMode } from "@/models/schedule.model";
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