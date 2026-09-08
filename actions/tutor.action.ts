"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Tutor, { timeToMinutes, DayOfWeek } from "@/models/tutor.model";
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