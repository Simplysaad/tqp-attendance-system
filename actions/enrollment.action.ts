"use server";

import connectDB from "@/lib/db";
import Schedule from "@/models/schedule.model";
import Student from "@/models/student.model";
import Tutor from "@/models/tutor.model";
import { getSession } from "@/actions/user.action";
import { revalidatePath } from "next/cache";


export async function enrollWithTutor(tutorId: string) {
    const authSession = await getSession();

    if (!authSession || authSession.role !== "student") {
        return { success: false, error: "Only students can enroll with a tutor." };
    }

    await connectDB();

    // 1. Get Student document
    const student = await Student.findOne({ user: authSession.id });
    if (!student) {
        return { success: false, error: "Student profile not found." };
    }

    // 2. Check if student is already enrolled with ANY tutor
    const existingEnrollment = await Schedule.findOne({
        students: student._id,
        status: "active",
    });

    if (existingEnrollment) {
        return {
            success: false,
            error: "You are already enrolled with a tutor. Unenroll first to change tutors.",
        };
    }

    // 3. Verify target tutor & calculate total capacity
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
        return { success: false, error: "Tutor not found." };
    }

    const tutorSchedules = await Schedule.find({ tutor: tutorId, status: "active" });

    // Count unique students across tutor's schedules
    const currentStudents = new Set<string>();
    tutorSchedules.forEach((sched) => {
        sched.students?.forEach((stId) => currentStudents.add(stId.toString()));
    });

    const maxCapacity = tutor.maximumStudents || 5;
    if (currentStudents.size >= maxCapacity) {
        return { success: false, error: "This tutor's class is already filled up." };
    }

    // 4. Enroll student into ALL of this tutor's active schedules
    await Schedule.updateMany(
        { tutor: tutorId, status: "active" },
        { $addToSet: { students: student._id } }
    );

    revalidatePath("/enroll");
    revalidatePath("/dashboard");

    return {
        success: true,
        message: "Successfully enrolled! You have inherited all of this tutor's schedules.",
    };
}


export async function getTutorStudents(userId: string) {
    await connectDB();

    const tutor = await Tutor.findOne({ user: userId }).lean();
    if (!tutor) return { success: false, students: [] };

    // Fetch all schedules for this tutor and populate student details
    const schedules = await Schedule.find({ tutor: tutor._id, status: "active" })
        .populate({
            path: "students",
            populate: { path: "user", select: "name email image" },
        })
        .lean();

    // Map and deduplicate students across multiple schedule slots
    const studentMap = new Map();

    schedules.forEach((sched: any) => {
        if (sched.students && Array.isArray(sched.students)) {
            sched.students.forEach((st: any) => {
                if (st && st._id && !studentMap.has(st._id.toString())) {
                    studentMap.set(st._id.toString(), {
                        _id: st._id.toString(),
                        fullName: st.fullName || st.user?.name || "Enrolled Student",
                        email: st.email || st.user?.email || "N/A",
                        phone: st.phoneNumber || "N/A",
                        enrolledSlot: `${sched.dayOfWeek} (${Math.floor(sched.startTime / 60)}:00)`,
                    });
                }
            });
        }
    });

    return {
        success: true,
        students: Array.from(studentMap.values()),
    };
}