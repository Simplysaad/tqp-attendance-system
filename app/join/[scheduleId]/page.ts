import { redirect } from "next/navigation";
import { getSession } from "@/actions/user.action";
import connectDB from "@/lib/db";
import Schedule from "@/models/schedule.model";
import Session from "@/models/session.model";
import Student from "@/models/student.model";

interface JoinPageProps {
    params: Promise<{ scheduleId: string }>;
}

export default async function JoinSessionPage({ params }: JoinPageProps) {
    const { scheduleId } = await params;

    // 1. Auth check
    const authSession = await getSession();
    if (!authSession || authSession.role !== "student") {
        redirect("/login");
    }

    await connectDB();

    let redirectTarget = "/dashboard?error=join_failed";

    try {
        const schedule = await Schedule.findById(scheduleId).lean();
        if (!schedule) {
            redirect("/dashboard?error=schedule_not_found");
        }

        const student = await Student.findOne({ user: authSession.id })
        if (!student) {
            redirect("/dashboard?error=schedule_not_found");
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        let session = await Session.findOne({
            schedule: scheduleId,
            student: student._id,
            date: today,
        });

        if (session) {
            session.clickCount = (session.clickCount || 0) + 1;
            session.attendance = "present";
            session.joinedAt = session.joinedAt || new Date();
            await session.save();
        } else {
            session = await Session.create({
                name: authSession.name,
                schedule: scheduleId,
                student: student._id,
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

        redirectTarget = schedule.googleMeetLink || `/dashboard/sessions/${session._id}`;

    } catch (error) {
        console.error("Error joining session:", error);
        redirect("/dashboard?error=join_failed");
    }

    // Next.js redirect must run outside try/catch blocks
    redirect(redirectTarget);
}