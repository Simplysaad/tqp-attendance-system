"use server";

import connectDB from "@/lib/db";
import Schedule from "@/models/schedule.model";
import Student from "@/models/student.model";
import Tutor from "@/models/tutor.model";
import { getSession } from "@/actions/user.action";
import { revalidatePath } from "next/cache";
import Types from "mongoose";
import TutorGroup from "@/models/tutorGroup.model";


export async function enrollWithTutor(tutorId: string) {
    try {
        const currentUser = await getSession();

        if (!currentUser) {
            return {
                success: false,
                error: "UNAUTHENTICATED",
                redirectTo: `/login?next=${encodeURIComponent(`/enroll?tutor_id=${tutorId}`)}`,
            };
        }

        if (currentUser.role !== "student") {
            return { success: false, error: "Only students can enroll with a tutor." };
        }

        if (!tutorId) {
            return { success: false, error: "Invalid tutor ID provided." };
        }

        await connectDB();

        // 1. Fetch Student profile
        const student = await Student.findOne({ user: currentUser.id });
        if (!student) {
            return { success: false, error: "Student profile not found." };
        }

        const studentId = student._id;


        // 2. Prevent multi-group enrollments
        const existingEnrollment = await TutorGroup.findOne({
            students: studentId,
            isActive: true,
        });

        if (existingEnrollment) {
            return {
                success: false,
                error: "You are already enrolled with a tutor. Unenroll first to change tutors.",
            };
        }

        // 3. Verify target tutor exists
        const tutor = await Tutor.findById(tutorId);
        if (!tutor) {
            return { success: false, error: "Tutor not found." };
        }

        // 4. Atomic check & enroll operation
        // Finds active group for target tutor WHERE student count < maxCapacity
        const updatedGroup = await TutorGroup.findOneAndUpdate(
            {
                tutor: tutorId,
                isActive: true,
                $expr: {
                    $lt: [{ $size: "$students" }, "$rules.maxCapacity"],
                },
            },
            {
                $addToSet: { students: studentId },
            },
            { new: true }
        );

        if (!updatedGroup) {
            // Determine exact failure reason for clear feedback
            const activeGroup = await TutorGroup.findOne({ tutor: tutorId, isActive: true });
            if (!activeGroup) {
                return {
                    success: false,
                    error: "This tutor does not have any active class available for enrollment.",
                };
            }
            return { success: false, error: "This tutor's class is already filled up." };
        }

        return {
            success: true,
            message: "Successfully enrolled! You have inherited all of this tutor's schedules.",
        };
    } catch (error) {
        console.error("Enrollment failed:", error);
        return {
            success: false,
            error: "An unexpected error occurred during enrollment.",
        };
    }
}

export async function getTutorStudents(userId: string) {
    try {
        await connectDB();

        const tutor = await Tutor.findOne({ user: userId }).lean();
        if (!tutor) return { success: false, students: [], message: "Tutor profile not found" };

        // Fetch active schedule group and populate student details (including whatsappNumber)
        const tutorGroup = await TutorGroup.findOne({ tutor: tutor._id, isActive: true })
            .populate({
                path: "students",
                populate: {
                    path: "user",
                    select: "name email whatsappNumber", // Added whatsappNumber here
                },
            })
            .lean();

        if (!tutorGroup || !tutorGroup.students) {
            return { success: true, students: [] };
        }

        // Map populated student records cleanly
        const students = tutorGroup.students.map((st: any) => {
            const user = st.user || {};
            return {
                _id: st._id ? st._id.toString() : "",
                fullName: user.name || "Enrolled Student",
                email: user.email || "N/A",
                whatsappNumber: user.whatsappNumber || "N/A",
            };
        });

        return {
            success: true,
            students,
        };
    } catch (error) {
        console.error("Failed to fetch tutor students:", error);
        return {
            success: false,
            students: [],
            error: "An unexpected error occurred while fetching students.",
        };
    }
}