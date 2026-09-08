import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/actions/user.action";
import connectDB from "@/lib/db";
import Schedule from "@/models/schedule.model";
import Session from "@/models/session.model";

export async function GET(
    req: NextRequest,
    { params }: { params: { scheduleId: string } }
) {
    const authSession = await getSession();

    if (!authSession || authSession.role !== "student") {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    await connectDB();

    const schedule = await Schedule.findById(params.scheduleId);
    if (!schedule) {
        return NextResponse.redirect(new URL("/dashboard?error=ScheduleNotFound", req.url));
    }

    // Define normalized "today" start date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's Session document for this specific student
    let studentSession = await Session.findOne({
        schedule: schedule._id,
        student: authSession.studentProfileId, // ID from student model
        date: today,
    });

    if (!studentSession) {
        studentSession = new Session({
            schedule: schedule._id,
            student: authSession.studentProfileId,
            tutor: schedule.tutor,
            date: today,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            attendance: "present",
            joinedAt: new Date(),
            clickCount: 1,
        });
    } else {
        studentSession.attendance = "present";
        studentSession.clickCount = (studentSession.clickCount || 0) + 1;
        if (!studentSession.joinedAt) {
            studentSession.joinedAt = new Date();
        }
    }

    await studentSession.save();

    // Redirect to Google Meet URL
    return NextResponse.redirect(schedule.googleMeetLink || "/dashboard");
}