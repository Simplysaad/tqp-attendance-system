import { getSession } from "@/actions/user.action";
import StudentOnboardingForm from "./StudentOnboarding";
import TutorOnboardingForm from "./TutorOnboarding";
import Student from "@/models/student.model";
import Tutor from "@/models/tutor.model";
import connectDB from "@/lib/db";
import { redirect } from "next/navigation";

const Onboarding = async () => {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const { id: userId, role } = session;

    await connectDB();

    const isStudent = await Student.findOne({ user: userId });
    const isTutor = await Tutor.findOne({ user: userId });

    const hasOnboarded = Boolean(isStudent || isTutor);

    if (hasOnboarded) {
        redirect("/dashboard");
    }

    if (role === "student") {
        return <StudentOnboardingForm userId={userId} />;
    }

    if (role === "tutor") {
        return <TutorOnboardingForm userId={userId} />;
    }

    redirect("/dashboard");
};

export default Onboarding;