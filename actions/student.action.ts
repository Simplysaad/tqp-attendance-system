"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Student, { IMemorization } from "@/models/student.model";
import { getSession } from "./user.action";
import Goal from "@/models/goal.model";
import User from "@/models/user.model";
import { subtreeHasSpeculativePrefetch } from "next/dist/client/components/segment-cache/scheduler";
import { QURAN_SURAHS } from "@/lib/surah";
import axios from "axios";


export interface CompleteStudentOnboardingInput {
    userId: string;
    gender: "male" | "female";
    matricNumber?: string;
    faculty?: string;
    department?: string;
    level?: number;
    currentMemorization?: IMemorization;
    expectedMemorization?: IMemorization;
}


export async function completeStudentOnboarding(data: CompleteStudentOnboardingInput) {
    try {
        await connectDB();

        // 1. Authenticate & Verify User Session
        const currentUser = await getSession();
        if (!currentUser) {
            return { success: false, message: "Unauthorized request." };
        }

        const { id: userId } = currentUser;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // 2. Check for Existing Student
        const existingStudent = await Student.findOne({ user: userObjectId });
        if (existingStudent) {
            return { success: false, message: "Student profile already exists for this user." };
        }

        // Default fallback values for Quranic position if left empty
        const defaultPosition: IMemorization = {
            surah: "Al-Fatiha",
            aayah: 1,
            juz: 1,
            page: 1,
        };

        const currentMemorization = data.currentMemorization || defaultPosition;
        const targetMemorization = data.expectedMemorization || defaultPosition;

        // 3. Create Student Profile
        // const newStudent = await Student.create({
        //     user: userObjectId,
        //     gender: data.gender,
        //     matricNumber: data.matricNumber?.trim() || undefined,
        //     faculty: data.faculty,
        //     department: data.department,
        //     level: data.level ? Number(data.level) : undefined,
        //     currentMemorization,
        //     status: "active",
        // });


        // Get aayah from quran.foundation


        // 4. Create Initial Semester Goal
        // const newGoal = await Goal.create({
        //     student: newStudent._id,
        //     semester: "Harmattan",
        //     type: "memorization",
        //     title: "My Initial Hifz Goal",
        //     current: currentMemorization,
        //     target: targetMemorization,
        // });

        // 5. Link Initial Goal & Update User Onboarding Status
        // await Promise.all([
        //     Student.findByIdAndUpdate(newStudent._id, { currentGoal: newGoal._id }),
        //     User.findByIdAndUpdate(userObjectId, {
        //         role: "student",
        //         isOnboarded: true,
        //     }),
        // ]);

        revalidatePath("/dashboard");
        return {
            success: true,
            studentId: newStudent._id.toString(),
            goalId: newGoal._id.toString(),
        };
    } catch (error: any) {
        console.error("Error completing student onboarding:", error);
        return {
            success: false,
            message: error.message || "Failed to create student profile.",
        };
    }
}