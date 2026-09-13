import { redirect } from "next/navigation";
import { getSession } from "@/actions/user.action"; // Or your auth helper path
import Student from "@/models/student.model";
import { joinSessionViaLink } from "@/actions/session.action";
import connectDB from "@/lib/db";

interface JoinPageProps {
    params: Promise<{ id: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
    const { id: tutorGroupId } = await params;

    // 1. Auth check
    const currentUser = await getSession();
    if (!currentUser || currentUser.role !== "student") {
        redirect(`/login?next=/join/${tutorGroupId}`);
    }

    await connectDB();

    // 2. Fetch Student by linked user ID (currentUser.id or currentUser._id)
    const userId = currentUser.id || currentUser._id;
    const student = await Student.findOne({ user: userId });

    if (!student) {
        redirect("/dashboard?error=" + encodeURIComponent("Student profile not found."));
    }

    // 3. Join session action
    const response = await joinSessionViaLink(tutorGroupId, student._id.toString());

    if (!response.success || !response.redirectUrl) {
        const errorMsg = response.error || "Unable to join live class.";
        redirect("/dashboard?error=" + encodeURIComponent(errorMsg));
    }

    // 4. Redirect student to Google Meet link
    redirect(response.redirectUrl);
}