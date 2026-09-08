import { getSession } from "@/actions/user.action";
import StudentDashboard from "./StudentDashboard";
import TutorDashboard from "./TutorDashboard";
import AdminDashboard from "./AdminDashboard";
import Student from "@/models/student.model";
import Tutor from "@/models/tutor.model";
import connectDB from "@/lib/db";
import { redirect } from "next/navigation";

const Dashboard = async () => {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const { id: userId, role } = session;

    if (role === "admin" || role === "coordinator") {
        return <AdminDashboard userId={userId} />;
    }

    await connectDB();

    if (role === "student") {
        const studentProfile = await Student.findOne({ user: userId });
        if (!studentProfile) {
            redirect("/onboarding");
        }
        return <StudentDashboard userId={userId} />;
    }

    if (role === "tutor") {
        const tutorProfile = await Tutor.findOne({ user: userId });
        if (!tutorProfile) {
            redirect("/onboarding");
        }
        return <TutorDashboard userId={userId} />;
    }

    // Fallback redirect if role is unknown
    redirect("/onboarding");
};

export default Dashboard;