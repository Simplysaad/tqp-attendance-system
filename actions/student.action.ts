"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Student, { IMemorization } from "@/models/student.model";
import { getSession } from "./user.action";
import Goal from "@/models/goal.model";
import User from "@/models/user.model";
import { QURAN_SURAHS } from "@/lib/surah";
import { getMemorizationPosition } from "@/lib/quran";


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

// Global mushaf ordinal (ayah count from the start of the Qur'an) for a position,
// derived from the local surah table. Used to count the verses between two positions.
function verseOrdinal(pos?: IMemorization): number {
    if (!pos?.surah || !pos.aayah) return 0;
    const surah = QURAN_SURAHS.find(
        (s) => s.name.toLowerCase() === pos.surah!.trim().toLowerCase()
    );
    if (!surah) return 0;
    const versesBefore = QURAN_SURAHS
        .filter((s) => s.number < surah.number)
        .reduce((sum, s) => sum + s.totalAayahs, 0);
    return versesBefore + pos.aayah;
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
        const newStudent = await Student.create({
            user: userObjectId,
            gender: data.gender,
            matricNumber: data.matricNumber?.trim() || undefined,
            faculty: data.faculty,
            department: data.department,
            level: data.level ? Number(data.level) : undefined,
            currentMemorization,
            status: "active",
        });

        // 4. Measure the distance between the current and target positions.
        //    verses: counted locally from the surah table (surah + aayah).
        //    pages:  taken from quran.foundation's page numbers for each position.
        const targetVerses = Math.abs(
            verseOrdinal(targetMemorization) - verseOrdinal(currentMemorization)
        );

        let targetPages = 0;
        try {
            const [currentPos, targetPos] = await Promise.all([
                getMemorizationPosition(
                    currentMemorization.surah ?? defaultPosition.surah!,
                    currentMemorization.aayah ?? defaultPosition.aayah!
                ),
                getMemorizationPosition(
                    targetMemorization.surah ?? defaultPosition.surah!,
                    targetMemorization.aayah ?? defaultPosition.aayah!
                ),
            ]);
            targetPages = Math.abs((targetPos.page ?? 0) - (currentPos.page ?? 0));
        } catch (error) {
            console.error("QF page lookup failed; leaving targetPages at 0:", error);
        }

        // 5. Create Initial Semester Goal
        const newGoal = await Goal.create({
            student: newStudent._id,
            semester: "Harmattan",
            type: "memorization",
            title: "My Initial Hifz Goal",
            current: currentMemorization,
            target: targetMemorization,
            targetPages,
            targetVerses,
        });

        // 6. Update User Onboarding Status
        await User.findByIdAndUpdate(userObjectId, {
            role: "student",
            isOnboarded: true,
        });

        revalidatePath("/dashboard");
        return {
            success: true,
            studentId: String(newStudent._id),
            goalId: String(newGoal._id),
        };
    } catch (error: any) {
        console.error("Error completing student onboarding:", error);
        return {
            success: false,
            message: error.message || "Failed to create student profile.",
        };
    }
}

/**
 * Client-callable lookup used by the onboarding form: resolve the authoritative
 * juz + page for a surah name + aayah number from the QF Content API, so those
 * fields can be auto-filled (and locked) once the student picks a surah + aayah.
 */
export async function lookupMemorizationPosition(surah: string, aayah: number) {
    try {
        const pos = await getMemorizationPosition(surah, aayah);
        return { success: true as const, juz: pos.juz, page: pos.page };
    } catch (error: any) {
        console.error("QF position lookup failed:", error);
        return {
            success: false as const,
            message: error?.message || "Failed to look up position.",
        };
    }
}
