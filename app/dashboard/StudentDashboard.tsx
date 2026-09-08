import connectDB from "@/lib/db";
import Student from "@/models/student.model";
import Schedule from "@/models/schedule.model";
import Session from "@/models/session.model";
import JoinClassButton from "@/components/JoinClassButton";

interface StudentDashboardProps {
    userId: string;
}

function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export default async function StudentDashboard({ userId }: StudentDashboardProps) {
    await connectDB();

    // 1. Fetch student profile
    const student = await Student.findOne({ user: userId }).lean();

    if (!student) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold">Profile Incomplete</h2>
                <p className="text-gray-500">Please complete your student onboarding process.</p>
            </div>
        );
    }

    // 2. Fetch the schedule this student is enrolled in
    const assignedSchedule: any = await Schedule.findOne({
        students: student._id,
        status: "active",
    })
        .populate({
            path: "tutor",
            populate: { path: "user", select: "name" },
        })
        .lean();

    // 3. Check if tutor activated today's session link
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let isLinkActive = false;
    if (assignedSchedule) {
        const todaySession = await Session.findOne({
            schedule: assignedSchedule._id,
            student: student._id,
            date: today,
        }).lean();

        isLinkActive = Boolean(todaySession?.isLinkActive);
    }

    const statusColors: Record<string, string> = {
        active: "bg-green-100 text-green-800 border-green-300",
        "at risk": "bg-yellow-100 text-yellow-800 border-yellow-300",
        inactive: "bg-red-100 text-red-800 border-red-300",
    };

    const hasMeetLink = Boolean(
        assignedSchedule?.googleMeetLink || assignedSchedule?.pseudoLink
    );

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
                    {student.status === "active"
                        ? "🟢 On Track"
                        : student.status === "at risk"
                            ? "🟡 At Risk"
                            : "🔴 Inactive"}
                </span>
            </div>

            {/* Live Class Joining Banner */}
            <div
                className={`p-5 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${isLinkActive
                    ? "bg-emerald-50 border-emerald-300"
                    : "bg-gray-50 border-gray-200"
                    }`}
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base">
                            {assignedSchedule
                                ? `Tutor: ${assignedSchedule.tutor?.user?.name || "Assigned Ustadh"}`
                                : "No Enrolled Tutor"}
                        </h3>
                        {isLinkActive && (
                            <span className="text-xs bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full">
                                Class Live
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600">
                        {assignedSchedule
                            ? `Weekly Slot: ${assignedSchedule.dayOfWeek}s (${minutesToTime(
                                assignedSchedule.startTime
                            )} - ${minutesToTime(assignedSchedule.endTime)})`
                            : "Please enroll with a tutor to see your upcoming schedule."}
                    </p>
                </div>

                {assignedSchedule && (
                    <JoinClassButton
                        isLinkActive={isLinkActive}
                        meetLinkAvailable={hasMeetLink}
                    />
                )}
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
                        {student.currentMemorization?.juz
                            ? `Juz ${student.currentMemorization.juz}`
                            : "Not set"}
                    </p>
                </div>

                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase">Current Page</h3>
                    <p className="text-lg font-bold text-gray-800">
                        {student.currentMemorization?.page
                            ? `Page ${student.currentMemorization.page}`
                            : "Not set"}
                    </p>
                </div>
            </div>
        </div>
    );
}