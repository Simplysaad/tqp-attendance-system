import connectDB from "@/lib/db";
import Schedule from "@/models/schedule.model";
import Student from "@/models/student.model";
import Tutor from "@/models/tutor.model";
import { getSession } from "@/actions/user.action";
import EnrollTutorButton from "@/components/EnrollButton";
import { redirect } from "next/navigation";
import { enrollWithTutor } from "@/actions/enrollment.action";
import { Calendar, Clock } from "lucide-react";

function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

interface PageProps {
    searchParams: Promise<{ tutor_id?: string; error?: string; message?: string }>;
}

export default async function EnrollPage({ searchParams }: PageProps) {
    const { tutor_id, error, message } = await searchParams;

    await connectDB();
    const authSession = await getSession();

    // 1. Authentication Check
    if (!authSession) {
        const nextUrl = tutor_id ? `/enroll?tutor_id=${tutor_id}` : "/enroll";
        redirect(`/login?next=${encodeURIComponent(nextUrl)}`);
    }

    if (authSession.role !== "student") {
        redirect("/dashboard");
    }

    // 2. Direct Server Action Flow (When tutor_id is provided)
    if (tutor_id) {
        const res = await enrollWithTutor(tutor_id);

        if (!res.success) {
            // Pass error back to the page or redirect to dashboard
            redirect(`/dashboard?error=${encodeURIComponent(res.error || "Enrollment failed")}`);
        } else {
            // Redirect with success message
            redirect(`/dashboard?message=${encodeURIComponent(res.message || "Enrolled successfully!")}`);
        }
    }

    // 3. Fallback: Render Tutor Selection UI when no tutor_id is provided
    let currentStudentId: string | null = null;
    if (authSession?.role === "student") {
        const student = await Student.findOne({ user: authSession.id }).lean();
        if (student) currentStudentId = student._id.toString();
    }

    const tutors = await Tutor.find().populate("user", "name email").lean();
    const allSchedules = await Schedule.find({}).lean();

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                    {error}
                </div>
            )}
            {message && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
                    {message}
                </div>
            )}

            <div>
                <h1 className="text-3xl font-bold text-gray-900">Choose a Tutor</h1>
                <p className="text-gray-600 text-sm mt-1">
                    Select a tutor to commit to all of their weekly class schedules. Tutors take a maximum of 5 students.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tutors.map((tutor: any) => {
                    const tutorIdStr = tutor._id.toString();
                    console.log("tutorIdStr", tutorIdStr)
                    const tutorSchedules = allSchedules.filter(
                        (s) => s.tutor.toString() === tutorIdStr
                    );

                    const uniqueStudentIds = new Set<string>();
                    tutorSchedules.forEach((s) => {
                        s.students?.forEach((stId: any) => uniqueStudentIds.add(stId.toString()));
                    });

                    const totalEnrolled = uniqueStudentIds.size;
                    const maxCapacity = tutor.maximumStudents || 5;
                    const isFilled = totalEnrolled >= maxCapacity;
                    const isAlreadyEnrolled = currentStudentId ? uniqueStudentIds.has(currentStudentId) : false;

                    return (
                        <div
                            key={tutorIdStr}
                            className="border rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between space-y-5 hover:border-emerald-300 transition"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-start border-b pb-3">
                                    <div>
                                        <h2 className="font-bold text-lg text-gray-900">
                                            {tutor.user?.name
                                                ? `${tutor.gender === "female" ? "Ustadhah" : "Ustadh"} ${tutor.user.name.split(" ")[1] || tutor.user.name}`
                                                : "Qur'an Tutor"}
                                        </h2>
                                        <p className="text-xs text-gray-500">{tutor.bio}</p>
                                    </div>
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${isFilled
                                            ? "bg-red-100 text-red-700"
                                            : "bg-emerald-100 text-emerald-800"
                                            }`}
                                    >
                                        {totalEnrolled} / {maxCapacity} Enrolled
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Weekly Class Timetable
                                    </h4>
                                    {tutorSchedules.length > 0 ? (
                                        <div className="space-y-1.5">
                                            {tutorSchedules.map((slot: any) => (
                                                <div
                                                    key={slot._id.toString()}
                                                    className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border text-xs"
                                                >
                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800 capitalize">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                                        {slot.dayOfWeek}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 font-mono text-emerald-700 font-medium">
                                                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                        {minutesToTime(slot.startTime)} - {minutesToTime(slot.endTime)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic py-2">
                                            No weekly schedules published yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <EnrollTutorButton
                                tutorId={tutorIdStr}
                                isFilled={isFilled}
                                isAlreadyEnrolled={isAlreadyEnrolled}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}