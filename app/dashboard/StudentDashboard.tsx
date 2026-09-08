import connectDB from "@/lib/db";
import Student from "@/models/student.model";

interface StudentDashboardProps {
    userId: string;
}

export default async function StudentDashboard({ userId }: StudentDashboardProps) {
    await connectDB();

    // Fetch student profile linked to this user ID
    const student = await Student.findOne({ user: userId }).lean();

    if (!student) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold">Profile Incomplete</h2>
                <p className="text-gray-500">Please complete your student onboarding process.</p>
            </div>
        );
    }

    const statusColors = {
        active: "bg-green-100 text-green-800 border-green-300",
        "at risk": "bg-yellow-100 text-yellow-800 border-yellow-300",
        inactive: "bg-red-100 text-red-800 border-red-300",
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header & Status */}
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold">Student Dashboard</h1>
                    <p className="text-gray-500 text-sm">
                        {student.department ? `${student.department} (${student.level} Level)` : "TQP Student"}
                    </p>
                </div>
                <span
                    className={`px-3 py-1 text-sm font-medium border rounded-full capitalize ${statusColors[student.status] || "bg-gray-100 text-gray-800"
                        }`}
                >
                    {student.status === "active" ? "🟢 On Track" : student.status === "at risk" ? "🟡 At Risk" : "🔴 Inactive"}
                </span>
            </div>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase">Current Surah</h3>
                    <p className="text-lg font-bold text-gray-800">
                        {student.currentMemorization?.surah || "Not set"}
                    </p>
                </div>

                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase">Current Juz</h3>
                    <p className="text-lg font-bold text-gray-800">
                        {student.currentMemorization?.juz ? `Juz ${student.currentMemorization.juz}` : "Not set"}
                    </p>
                </div>

                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase">Current Page</h3>
                    <p className="text-lg font-bold text-gray-800">
                        {student.currentMemorization?.page ? `Page ${student.currentMemorization.page}` : "Not set"}
                    </p>
                </div>
            </div>

            {/* Action Banner for Next Class */}
            <div className="p-5 border rounded-lg bg-blue-50 border-blue-200 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-blue-900">Upcoming Class</h3>
                    <p className="text-sm text-blue-700">Check your schedule to join active Google Meet sessions.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    View Class Link
                </button>
            </div>
        </div>
    );
}