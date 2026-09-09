import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { getSession } from "@/actions/user.action";
import Session from "@/models/session.model";
import LogProgressForm from "./StudentLogForm";
import TutorSessionVerificationForm from "./TutorSessionVerificationForm";

interface SessionPageProps {
    params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: SessionPageProps) {
    // 1. Authenticate user session
    const authSession = await getSession();
    if (!authSession) {
        redirect("/login");
    }

    const { id: sessionId } = await params;

    // 2. Connect DB and fetch session document
    await connectDB();
    const sessionDoc = await Session.findById(sessionId)
        .populate("student", "name _id user")
        .populate("tutor", "name _id user")
        .lean();

    // If session doesn't exist, route back to dashboard
    if (!sessionDoc) {
        redirect("/dashboard");
    }

    // Convert Mongoose document to plain JS object for Client Components
    const session = JSON.parse(JSON.stringify(sessionDoc));

    const userId = authSession.id;

    const userRole = authSession.role;
    // 3. Authorization Check (Permission Guard)
    const isAssignedStudent = userRole === "student" && session.student?.user?.toString() === userId;
    const isAssignedTutor = userRole === "tutor" && session.tutor?.user?.toString() === userId;


    const studentId = isAssignedStudent && session.student?._id
    const tutorId = isAssignedTutor && session.tutor?._id


    console.log("session", session)
    console.log("userId", userId)
    console.log("isAssignedStudent", isAssignedStudent)
    console.log("isAssignedTutor", isAssignedTutor)


    if (!isAssignedStudent && !isAssignedTutor) {
        // Redirect unauthorized users (e.g. students viewing other students' sessions)
        redirect("/dashboard");
    }

    // Helpers for displaying formatting ranges
    const formatRange = (range?: { start?: { surah?: string; aayah?: number }; end?: { surah?: string; aayah?: number } }) => {
        if (!range?.start?.surah) return "Not logged";
        return `${range.start.surah} (${range.start.aayah || 1}) ➔ ${range.end?.surah || range.start.surah} (${range.end?.aayah || "End"})`;
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
            {/* Session Metadata Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Session Details</h1>
                        <p className="text-xs text-gray-400">
                            {new Date(session.date).toLocaleDateString("en-GB", {
                                weekday: "long",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                    <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${session.attendance === "present"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : session.attendance === "absent"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                    >
                        {session.attendance}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                        <span className="block text-xs text-gray-400">Student</span>
                        <span className="font-medium text-gray-800">{session.student?.name || "Student"}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-400">Tutor</span>
                        <span className="font-medium text-gray-800">{session.tutor?.name || "Tutor"}</span>
                    </div>
                </div>
            </div>

            {/* 4. Role-Based Form Rendering */}
            {isAssignedTutor && (
                <TutorSessionVerificationForm session={session} tutorId={tutorId} />
            )}

            {isAssignedStudent && (
                <>
                    {/* If the student hasn't logged memorization yet, show the submission form */}
                    {!session.newMemorization?.start?.surah ? (
                        <LogProgressForm sessionId={session._id} studentId={studentId} />
                    ) : (
                        /* If already logged, show read-only status */
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-base font-semibold text-gray-900">Submitted Progress</h3>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm space-y-2">
                                <div>
                                    <span className="text-xs text-gray-500 block">Logged Range:</span>
                                    <span className="font-medium text-gray-800">{formatRange(session.newMemorization)}</span>
                                </div>
                                {session.tutorsComment && (
                                    <div className="pt-2 border-t border-gray-200">
                                        <span className="text-xs text-gray-500 block">Tutor Feedback:</span>
                                        <p className="text-gray-700 italic">"{session.tutorsComment}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}