import connectDB from "@/lib/db";
import Tutor, { minutesToTime } from "@/models/tutor.model";
import Schedule, { IScheduleDocument } from "@/models/schedule.model";
import Link from "next/link";
import ActivateNearestScheduleButton from "@/components/ActivateLinkButton";
import TutorStudentsList from "@/components/TutorStudentsList";

interface TutorDashboardProps {
    userId: string;
}


export default async function TutorDashboard({ userId }: TutorDashboardProps) {
    await connectDB();

    const tutor = await Tutor.findOne({ user: userId }).lean();

    if (!tutor) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold">Profile Incomplete</h2>
                <p className="text-gray-500">Please complete your tutor onboarding process.</p>
            </div>
        );
    }

    // Fetch active schedules for this tutor and populate assigned students
    const schedules = await Schedule.find({ tutor: tutor._id, status: "active" })
        .populate("students", "fullName email")
        .sort({ dayOfWeek: 1, startTime: 1 })
        .lean<IScheduleDocument[]>();

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold">Tutor Dashboard</h1>
                    <p className="text-gray-500 text-sm">Managing Qur'an memorisation sessions</p>
                </div>
                <div className="text-right">
                    <span className="text-xs text-gray-500 block">Student Capacity</span>
                    <span className="font-bold text-lg text-emerald-600">{tutor.maximumStudents} Max</span>
                </div>
            </div>
            {/* Quick Action: Start/Activate Session */}
            <div className="p-5 border rounded-lg bg-emerald-50 border-emerald-200 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-emerald-900">Start Today's Session</h3>
                    <p className="text-sm text-emerald-700">
                        Activate your pseudo link to allow assigned students to join class today.
                    </p>
                </div>
                <div className="flex gap-2">
                    <ActivateNearestScheduleButton />
                    <Link
                        href="/schedule/create"
                        className="px-4 py-2 bg-white text-emerald-700 border border-emerald-300 rounded-md text-sm font-medium hover:bg-emerald-100 transition"
                    >
                        Create Schedule
                    </Link>
                </div>
            </div>

            {/* Availability Schedule Overview */}
            <div className="border rounded-lg p-5 bg-white shadow-sm space-y-3">
                <h3 className="font-semibold text-gray-800">Your Weekly Availability Window</h3>
                {tutor.availability && tutor.availability.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {tutor.availability.map((slot, idx) => (
                            <div key={idx} className="p-3 border rounded bg-gray-50 text-sm">
                                <span className="font-bold capitalize block text-gray-700">{slot.dayOfWeek}</span>
                                <span className="text-gray-600">
                                    {minutesToTime(slot.startTime)} - {minutesToTime(slot.endTime)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No general availability windows set up yet.</p>
                )}
            </div>

            {/* Active Class Schedules */}
            <div className="border rounded-lg p-5 bg-white shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                    <div>
                        <h3 className="font-semibold text-gray-800">Active Class Schedules</h3>
                        <p className="text-xs text-gray-500">Your scheduled class slots and meeting links</p>
                    </div>
                    <Link
                        href="/schedule/create"
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-700 transition"
                    >
                        + Add New Schedule
                    </Link>
                </div>

                {schedules && schedules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {schedules.map((item) => (
                            <div key={item._id.toString()} className="border p-4 rounded-lg bg-gray-50 space-y-2 text-sm relative">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold capitalize text-emerald-800 text-base">
                                        {item.dayOfWeek}
                                    </span>
                                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-medium">
                                        {item.mode}
                                    </span>
                                </div>

                                <div className="text-gray-700 font-medium">
                                    🕒 {minutesToTime(item.startTime)} - {minutesToTime(item.endTime)}
                                </div>

                                {item.googleMeetLink && (
                                    <div className="text-xs truncate">
                                        <span className="text-gray-500">Link: </span>
                                        <a
                                            href={item.googleMeetLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline font-mono hover:text-blue-800"
                                        >
                                            {item.googleMeetLink}
                                        </a>
                                    </div>
                                )}

                                <div className="pt-2 border-t text-xs text-gray-500 flex justify-between items-center">
                                    <span>
                                        Enrolled: {item.students ? item.students.length : 0} / {item.maxCapacity || 1} student(s)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 border border-dashed rounded-lg bg-gray-50 space-y-2">
                        <p className="text-sm text-gray-500">No active class schedules created yet.</p>
                        <Link
                            href="/schedule/create"
                            className="inline-block text-xs text-emerald-600 font-semibold hover:underline"
                        >
                            Create your first class schedule
                        </Link>
                    </div>
                )}
            </div>



            <TutorStudentsList userId={userId} />
        </div>
    );
}