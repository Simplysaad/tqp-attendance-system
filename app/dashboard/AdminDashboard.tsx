import connectDB from "@/lib/db";
import Student from "@/models/student.model";
import Tutor from "@/models/tutor.model";

interface AdminDashboardProps {
    userId: string;
}

export default async function AdminDashboard({ userId }: AdminDashboardProps) {
    await connectDB();

    // Aggregate program counts in parallel
    const [totalStudents, activeStudents, atRiskStudents, inactiveStudents, totalTutors] =
        await Promise.all([
            Student.countDocuments(),
            Student.countDocuments({ status: "active" }),
            Student.countDocuments({ status: "at risk" }),
            Student.countDocuments({ status: "inactive" }),
            Tutor.countDocuments({ isActive: true }),
        ]);

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="border-b pb-4">
                <h1 className="text-2xl font-bold">Program Overview (Coordinator)</h1>
                <p className="text-gray-500 text-sm">TQP Platform Central Command</p>
            </div>

            {/* Program Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase">Total Students</h3>
                    <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                </div>

                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <h3 className="text-xs font-semibold text-green-700 uppercase">On Track 🟢</h3>
                    <p className="text-2xl font-bold text-green-800">{activeStudents}</p>
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                    <h3 className="text-xs font-semibold text-yellow-700 uppercase">At Risk 🟡</h3>
                    <p className="text-2xl font-bold text-yellow-800">{atRiskStudents}</p>
                </div>

                <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                    <h3 className="text-xs font-semibold text-red-700 uppercase">Inactive 🔴</h3>
                    <p className="text-2xl font-bold text-red-800">{inactiveStudents}</p>
                </div>
            </div>

            {/* Tutor Capacity Card */}
            <div className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-gray-800">Active Tutors</h3>
                    <p className="text-sm text-gray-500">{totalTutors} tutors configured in system</p>
                </div>
                <button className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">
                    Manage Allocations
                </button>
            </div>
        </div>
    );
}