import { getSession } from "@/actions/user.action";

import AdminDashboard from "../admin/AdminDashboard";
import connectDB from "@/lib/db";
import { redirect } from "next/navigation";

const Dashboard = async () => {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const { id: userId, role } = session;

    if (role !== "admin" && role !== "coordinator") {
        redirect("/onboarding");
    }

    await connectDB();
    return <AdminDashboard userId={userId} />;

};

export default Dashboard;