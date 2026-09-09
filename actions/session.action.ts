"use server";

import Session, { AttendanceStatus, PerformanceRating, IMemorizationRange } from "@/models/session.model";
import Schedule from "@/models/schedule.model"; // Ensure Schedule model path is correct
import { revalidatePath } from "next/cache";

/**
 * 1. STUDENT ACTION: Click Pseudo Link
 * Either creates a new session marked as "present" or increments clickCount on existing today's session.
 */
export async function joinSessionViaLink(scheduleId: string, studentId: string) {
    try {
        const schedule = await Schedule.findById(scheduleId).lean();
        if (!schedule) {
            return { success: false, error: "Schedule not found" };
        }

        // Normalize date to start of current day UTC
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Check if session already exists for today
        let session = await Session.findOne({
            schedule: scheduleId,
            student: studentId,
            date: today,
        });

        if (session) {
            // Existing session: Increment click count and update join timestamp
            session.clickCount = (session.clickCount || 0) + 1;
            session.attendance = "present";
            session.joinedAt = session.joinedAt || new Date();
            await session.save();
        } else {
            // New session: Create initial record marked as present
            session = await Session.create({
                schedule: scheduleId,
                student: studentId,
                tutor: schedule.tutor,
                date: today,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                isLinkActive: true,
                joinedAt: new Date(),
                clickCount: 1,
                attendance: "present",
            });
        }

        revalidatePath("/dashboard");
        return { success: true, sessionId: session._id.toString() };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to join session" };
    }
}

/**
 * 2. STUDENT ACTION: Log Progress After Class
 * Allows the student to submit their new memorization and revision ranges.
 */
interface IStudentLogPayload {
    sessionId: string;
    studentId: string;
    newMemorization?: IMemorizationRange;
    revision?: IMemorizationRange;
}

export async function logStudentProgress(payload: IStudentLogPayload) {
    try {
        const { sessionId, studentId, newMemorization, revision } = payload;

        const session = await Session.findOne({ _id: sessionId, student: studentId });
        if (!session) {
            return { success: false, error: "Session record not found or unauthorized" };
        }

        if (newMemorization) session.newMemorization = newMemorization;
        if (revision) session.revision = revision;

        await session.save();

        revalidatePath("/dashboard");
        return { success: true, message: "Progress logged successfully" };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to log progress" };
    }
}

/**
 * 3. TUTOR ACTION: Verify, Edit, or Approve Session
 * Allows the tutor to update attendance status, adjust logged ranges, set performance ratings, and add comments.
 */

interface ITutorVerifyPayload {
    sessionId: string;
    tutorId: string;
    attendance: AttendanceStatus;
    performance?: PerformanceRating;
    tutorsComment?: string;
    newMemorization?: IMemorizationRange;
    revision?: IMemorizationRange;
}

export async function verifyAndCompleteSession(payload: ITutorVerifyPayload) {
    try {
        const {
            sessionId,
            tutorId,
            attendance,
            performance,
            tutorsComment,
            newMemorization,
            revision,
        } = payload;

        const session = await Session.findOne({ _id: sessionId, tutor: tutorId });
        if (!session) {
            return { success: false, error: "Session record not found or unauthorized" };
        }

        session.attendance = attendance;
        if (performance) session.performance = performance;
        if (tutorsComment !== undefined) session.tutorsComment = tutorsComment;
        if (newMemorization) session.newMemorization = newMemorization;
        if (revision) session.revision = revision;
        session.approved = true;

        await session.save();

        revalidatePath("/dashboard");
        return { success: true, message: "Session verified and saved" };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to verify session" };
    }
}