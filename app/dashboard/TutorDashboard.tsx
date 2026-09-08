import connectDB from "@/lib/db";
import Tutor, { minutesToTime } from "@/models/tutor.model";

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

            {/* Availability Schedule Overview */}
            <div className="border rounded-lg p-5 bg-white shadow-sm space-y-3">
                <h3 className="font-semibold text-gray-800">Your Weekly Class Schedule</h3>
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
                    <p className="text-sm text-gray-500">No availability slots set up yet.</p>
                )}
            </div>

            {/* Quick Action: Activate Class */}
            <div className="p-5 border rounded-lg bg-emerald-50 border-emerald-200 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-emerald-900">Start a Session</h3>
                    <p className="text-sm text-emerald-700">Activate your pseudo link to let assigned students join today's class[cite: 2].</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700">
                    Activate Link
                </button>
            </div>
        </div>
    );
}