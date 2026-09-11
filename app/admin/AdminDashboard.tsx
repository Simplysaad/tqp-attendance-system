// adminDashboard.tsx

import connectDB from "@/lib/db";
import Student from "@/models/student.model";
import Tutor from "@/models/tutor.model";
import Schedule from "@/models/schedule.model";
import Session from "@/models/session.model";
import Goal from "@/models/goal.model";
import Link from "next/link";

interface AdminDashboardProps {
    userId: string;
}

export default async function AdminDashboard({ userId }: AdminDashboardProps) {
    await connectDB();

    // 1. Parallel execution for high-level counts and global analytics
    const [
        totalStudents,
        activeStudents,
        atRiskStudents,
        inactiveStudents,
        totalTutors,
        activeSchedulesCount,
        allSchedules,
        allTutors,
        attendanceStats,
        goalStats,
        recentSessions,
    ] = await Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ status: "active" }),
        Student.countDocuments({ status: "at risk" }),
        Student.countDocuments({ status: "inactive" }),
        Tutor.countDocuments({ isActive: true }),
        Schedule.countDocuments({ status: "active" }),

        // Fetch schedules to compute assigned students set
        Schedule.find({}, "students tutor").lean(),

        // Fetch tutors to compute capacity utilization
        Tutor.find({ isActive: true }, "_id maximumStudents user")
            .populate({ path: "user", select: "name" })
            .lean(),

        // Aggregate global attendance rate across all session logs
        Session.aggregate([
            {
                $group: {
                    _id: "$attendance",
                    count: { $sum: 1 },
                },
            },
        ]),

        // Aggregate average semester goal completion percentage
        Goal.aggregate([
            { $match: { status: "in_progress" } },
            {
                $group: {
                    _id: null,
                    avgProgress: { $avg: "$progressPercentage" },
                    totalGoals: { $sum: 1 },
                },
            },
        ]),

        // Fetch recent 5 logged sessions across the platform
        Session.find()
            .sort({ date: -1 })
            .limit(5)
            .populate({ path: "student", populate: { path: "user", select: "name" } })
            .populate({ path: "tutor", populate: { path: "user", select: "name" } })
            .lean(),
    ]);


    // // console.log("allSchedules", allSchedules)
    // 2. Identify Unassigned Students Efficiently
    // Extract set of all student ObjectIds assigned to any schedule
    const assignedStudentIds = new Set(
        allSchedules.flatMap((s: any) => (s.students || []).map((id: any) => id.toString()))
    );

    // Query students who are active/at-risk but NOT present in assignedStudentIds
    const unassignedStudents = await Student.find({
        _id: { $nin: Array.from(assignedStudentIds) },
        status: { $ne: "inactive" },
    })
        .populate({ path: "user", select: "name email whatsappNumber" })
        .limit(5)
        .lean();

    const totalUnassignedCount = await Student.countDocuments({
        _id: { $nin: Array.from(assignedStudentIds) },
        status: { $ne: "inactive" },
    });

    // 3. Compute Tutor Capacity & Allocation Load
    // Count assigned students per tutor from schedules
    const tutorLoadMap: Record<string, number> = {};

    for (const schedule of allSchedules) {
        const tutorIdStr = schedule.tutor?.toString();
        const studentCount = schedule.students?.length || 0;


        if (tutorIdStr) {
            tutorLoadMap[tutorIdStr] = Math.max(
                tutorLoadMap[tutorIdStr] || 0,
                studentCount
            );
        }
    }

    let totalCapacity = 0;
    let totalAssignedSeats = 0;
    const tutorUtilizationList = allTutors.map((tutor: any) => {
        const capacity = tutor.maximumStudents || 5;
        const currentAssigned = tutorLoadMap[tutor._id.toString()] || 0;
        totalCapacity += capacity;
        totalAssignedSeats += currentAssigned;


        return {
            id: tutor._id.toString(),
            name: tutor.user?.name || "Ustadh",
            assigned: currentAssigned,
            capacity,
            availableSlots: Math.max(0, capacity - currentAssigned),
        };
    });

    // 4. Compute Attendance Percentage
    const totalSessionsLogged = attendanceStats.reduce((acc, curr) => acc + curr.count, 0);
    const presentCount = attendanceStats.find((s) => s._id === "present")?.count || 0;
    const globalAttendanceRate = totalSessionsLogged > 0
        ? Math.round((presentCount / totalSessionsLogged) * 100)
        : 0;

    // 5. Compute Goal Progress Average
    const avgGoalProgress = goalStats.length > 0 ? Math.round(goalStats[0].avgProgress) : 0;

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Program Overview (Coordinator)</h1>
                    <p className="text-gray-500 text-sm">TQP Platform Central Command</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admin/assignments"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition"
                    >
                        Bulk Assign Students
                    </Link>
                </div>
            </div>

            {/* 1. Core Health KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-white shadow-sm space-y-1">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase">Total Students</h3>
                    <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                </div>

                <div className="p-4 border rounded-lg bg-emerald-50 border-emerald-200 space-y-1">
                    <h3 className="text-xs font-semibold text-emerald-700 uppercase">On Track 🟢</h3>
                    <p className="text-2xl font-bold text-emerald-800">{activeStudents}</p>
                </div>

                <div className="p-4 border rounded-lg bg-amber-50 border-amber-200 space-y-1">
                    <h3 className="text-xs font-semibold text-amber-700 uppercase">At Risk 🟡</h3>
                    <p className="text-2xl font-bold text-amber-800">{atRiskStudents}</p>
                </div>

                <div className="p-4 border rounded-lg bg-rose-50 border-rose-200 space-y-1">
                    <h3 className="text-xs font-semibold text-rose-700 uppercase">Inactive 🔴</h3>
                    <p className="text-2xl font-bold text-rose-800">{inactiveStudents}</p>
                </div>
            </div>

            {/* 2. Platform Metrics & Live Session Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Active Live Classes */}
                <div className="p-4 border rounded-lg bg-white shadow-sm space-y-1">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase">Live Classes Right Now</h3>
                    <p className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                        {activeSchedulesCount > 0 && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />}
                        {activeSchedulesCount} Active
                    </p>
                    <p className="text-xs text-gray-500">Scheduled sessions online</p>
                </div>

                {/* Platform Attendance Rate */}
                <div className="p-4 border rounded-lg bg-white shadow-sm space-y-1">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase">Platform Attendance Rate</h3>
                    <p className="text-2xl font-bold text-gray-900">{globalAttendanceRate}%</p>
                    <p className="text-xs text-gray-500">Across {totalSessionsLogged} recorded sessions</p>
                </div>

                {/* Goal Progress Average */}
                <div className="p-4 border rounded-lg bg-white shadow-sm space-y-1">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase">Avg Semester Progress</h3>
                    <p className="text-2xl font-bold text-gray-900">{avgGoalProgress}%</p>
                    <p className="text-xs text-gray-500">Target goal completion rate</p>
                </div>
            </div>

            {/* 3. Actionable Operational Queues & Capacity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Unassigned Students Queue */}
                <div className="p-5 border rounded-xl bg-white shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                        <div>
                            <h2 className="font-bold text-gray-900">Unassigned Students Queue</h2>
                            <p className="text-xs text-gray-500">Students awaiting schedule & Ustadh matching</p>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                            {totalUnassignedCount} Pending
                        </span>
                    </div>

                    {unassignedStudents.length === 0 ? (
                        <p className="text-sm text-gray-500 py-6 text-center">All active students have been assigned!</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {unassignedStudents.map((std: any) => (
                                <div key={std._id.toString()} className="py-3 flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-medium text-gray-900">{std.user?.name || "New Student"}</p>
                                        <p className="text-xs text-gray-400">
                                            {std.gender} &bull; {std.department || "No Dept"} &bull; Juz {std.currentMemorization?.juz || 1}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/admin/assignments?studentId=${std._id.toString()}`}
                                        className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-medium rounded transition"
                                    >
                                        Assign
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    {totalUnassignedCount > 5 && (
                        <div className="pt-2 text-center border-t">
                            <Link href="/admin/assignments" className="text-xs font-medium text-emerald-700 hover:underline">
                                View all {totalUnassignedCount} unassigned students &rarr;
                            </Link>
                        </div>
                    )}
                </div>

                {/* Tutor Capacity & Utilization List */}
                <div className="p-5 border rounded-xl bg-white shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                        <div>
                            <h2 className="font-bold text-gray-900">Tutor Utilization & Capacity</h2>
                            <p className="text-xs text-gray-500">Allocated seats vs maximum capacity</p>
                        </div>
                        <span className="text-xs font-medium text-gray-500">
                            {totalAssignedSeats} / {totalCapacity} Seats Filled
                        </span>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-gray-50">
                        {tutorUtilizationList.map((tutor) => {
                            const percentage = Math.round((tutor.assigned / tutor.capacity) * 100);
                            return (
                                <div key={tutor.id} className="pt-2 first:pt-0 space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-800">{tutor.name}</span>
                                        <span className="text-xs text-gray-500">
                                            {tutor.assigned}/{tutor.capacity} ({tutor.availableSlots} open)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${percentage >= 100
                                                ? "bg-rose-500"
                                                : percentage >= 70
                                                    ? "bg-amber-500"
                                                    : "bg-emerald-500"
                                                }`}
                                            style={{ width: `${Math.min(100, percentage)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* 4. Recent Session Audit Feed */}
            <div className="p-5 border rounded-xl bg-white shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                    <div>
                        <h2 className="font-bold text-gray-900">Recent Session Logs Audit</h2>
                        <p className="text-xs text-gray-500">Real-time attendance and progress reports logged by tutors</p>
                    </div>
                    <Link href="/admin/sessions" className="text-xs font-medium text-emerald-700 hover:underline">
                        View All Audit Logs &rarr;
                    </Link>
                </div>

                {recentSessions.length === 0 ? (
                    <p className="text-sm text-gray-500 py-6 text-center">No session logs submitted yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="text-xs uppercase bg-gray-50 text-gray-400">
                                <tr>
                                    <th className="py-2.5 px-3">Date</th>
                                    <th className="py-2.5 px-3">Student</th>
                                    <th className="py-2.5 px-3">Ustadh</th>
                                    <th className="py-2.5 px-3">Attendance</th>
                                    <th className="py-2.5 px-3">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentSessions.map((sess: any) => (
                                    <tr key={sess._id.toString()} className="hover:bg-gray-50">
                                        <td className="py-2.5 px-3 text-xs text-gray-500">
                                            {new Date(sess.date).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                            })}
                                        </td>
                                        <td className="py-2.5 px-3 font-medium text-gray-900">
                                            {sess.student?.user?.name || "Student"}
                                        </td>
                                        <td className="py-2.5 px-3 text-gray-600">
                                            {sess.tutor?.user?.name || "Ustadh"}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span
                                                className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${sess.attendance === "present"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-rose-50 text-rose-700"
                                                    }`}
                                            >
                                                {sess.attendance}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-xs capitalize text-gray-500">
                                            {sess.performance || "N/A"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}