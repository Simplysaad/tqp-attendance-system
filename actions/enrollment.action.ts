"use server";

import connectDB from "@/lib/db";
import Schedule from "@/models/schedule.model";
import Student from "@/models/student.model";
import Tutor from "@/models/tutor.model";
import { getSession } from "@/actions/user.action";
import { revalidatePath } from "next/cache";
import Types from "mongoose";

export async function enrollWithTutor(tutorId: string) {
    const authSession = await getSession();

    if (!authSession) {
        return {
            success: false,
            error: "UNAUTHENTICATED",
            redirectTo: `/login?next=${encodeURIComponent(`/enroll?tutor_id=${tutorId}`)}`
        };
    }

    if (authSession.role !== "student") {
        return { success: false, error: "Only students can enroll with a tutor." };
    }

    await connectDB();

    // 1. Get Student document
    const student = await Student.findOne({ user: authSession.id });
    if (!student) {
        return { success: false, error: "Student profile not found." };
    }

    const studentObjectId = student._id.toHexString()
    // const tutorObjectId = new Types.ObjectId( tutorId.toString())
    const tutorObjectId = tutorId

    // 2. Check if student is already enrolled in any active schedule
    const existingEnrollment = await Schedule.findOne({
        students: studentObjectId,
    });

    if (existingEnrollment) {
        return {
            success: false,
            error: "You are already enrolled with a tutor. Unenroll first to change tutors.",
        };
    }

    // 3. Verify target tutor
    const tutor = await Tutor.findById(tutorObjectId);
    if (!tutor) {
        return { success: false, error: "Tutor not found." };
    }

    // Fetch active schedules for this tutor
    const tutorSchedules = await Schedule.find({ tutor: tutorObjectId });

    if (!tutorSchedules || tutorSchedules.length === 0) {
        return {
            success: false,
            error: "This tutor does not have any active class schedules available for enrollment.",
        };
    }

    // Calculate current unique enrolled capacity
    const currentStudents = new Set<string>();
    tutorSchedules.forEach((sched) => {
        sched.students?.forEach((stId: any) => currentStudents.add(stId.toString()));
    });

    const maxCapacity = tutor.maximumStudents || 5;
    if (currentStudents.size >= maxCapacity) {
        return { success: false, error: "This tutor's class is already filled up." };
    }

    // 4. Enroll student into ALL active schedules for this tutor
    const updateResult = await Schedule.updateMany(
        { tutor: tutorObjectId, status: "active" },
        { $addToSet: { students: studentObjectId } }
    );

    if (updateResult.modifiedCount === 0) {
        return { success: false, error: "Failed to process enrollment. Please try again." };
    }

    return {
        success: true,
        message: "Successfully enrolled! You have inherited all of this tutor's schedules.",
    };
}

export async function getTutorStudents(userId: string) {
    await connectDB();

    const tutor = await Tutor.findOne({ user: userId }).lean();
    if (!tutor) return { success: false, students: [] };

    // Fetch active schedules and populate student/user details
    const schedules = await Schedule.find({ tutor: tutor._id, status: "active" })
        .populate({
            path: "students",
            populate: { path: "user", select: "name email image" },
        })
        .lean();

    // Map and deduplicate unique students
    const studentMap = new Map();

    schedules.forEach((sched: any) => {
        if (sched.students && Array.isArray(sched.students)) {
            sched.students.forEach((st: any) => {
                if (st && st._id && !studentMap.has(st._id.toString())) {
                    const startMins = sched.startTime || 0;
                    const hours = Math.floor(startMins / 60).toString().padStart(2, "0");
                    const mins = (startMins % 60).toString().padStart(2, "0");

                    studentMap.set(st._id.toString(), {
                        _id: st._id.toString(),
                        fullName: st.fullName || st.user?.name || "Enrolled Student",
                        email: st.email || st.user?.email || "N/A",
                        phone: st.phoneNumber || "N/A",
                        enrolledSlot: `${sched.dayOfWeek} (${hours}:${mins})`,
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