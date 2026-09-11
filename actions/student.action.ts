"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Student from "@/models/student.model";
import { getSession } from "./user.action";

export interface CompleteStudentOnboardingInput {
    userId: string;
    gender: "male" | "female";
    matricNumber?: string;
    faculty?: string;
    department?: string;
    level?: number;
    currentMemorization?: {
        surah?: string;
        aayah?: number;
        juz?: number;
        page?: number;
    };
}

export async function completeStudentOnboarding(data: CompleteStudentOnboardingInput) {
    try {
        await connectDB();
        const currentUser = await getSession()

        const { id: userId } = currentUser;

        // Cast userId string to ObjectId for clean Mongoose querying
        const userObjectId = new mongoose.Types.ObjectId(userId);


        const existingStudent = await Student.findOne({ user: userObjectId });
        if (existingStudent) {
            return { success: false, message: "Student profile already exists for this user." };
        }

        const newStudent = await Student.create({
            user: userObjectId,
            gender: data.gender,
            matricNumber: data.matricNumber ? data.matricNumber.trim() : undefined,
            faculty: data.faculty,
            department: data.department,
            level: data.level ? Number(data.level) : undefined,
            currentMemorization: data.currentMemorization,
            status: "active",
        });

        // // console.log("newStudent", newStudent.populate("user"))

        revalidatePath("/dashboard");
        return { success: true, studentId: newStudent._id.toString() };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to create student profile." };
    }
}