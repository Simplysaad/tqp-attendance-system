"use client";

import { useTransition } from "react";
import { enrollWithTutor } from "@/actions/enrollment.action";
import { useRouter } from "next/navigation";

interface EnrollButtonProps {
    tutorId: string;
    isFilled?: boolean;
    isAlreadyEnrolled?: boolean;
}

export default function EnrollButton({
    tutorId,
    isFilled = false,
    isAlreadyEnrolled = false,
}: EnrollButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter()

    const handleEnroll = () => {
        if (confirm("By enrolling, you commit to this tutor's weekly class schedule. Continue?")) {
            startTransition(async () => {
                const res = await enrollWithTutor(tutorId);
                if (!res.success) {
                    alert(res.error);
                    router.push("/dashboard");
                } else {
                    alert(res.message);
                }
            });
        }
    };

    if (isAlreadyEnrolled) {
        return (
            <button
                disabled
                className="w-full py-2 px-4 bg-emerald-100 text-emerald-800 font-semibold rounded-md text-xs cursor-not-allowed"
            >
                ✓ Enrolled
            </button>
        );
    }

    if (isFilled) {
        return (
            <button
                disabled
                className="w-full py-2 px-4 bg-red-100 text-red-600 font-semibold rounded-md text-xs cursor-not-allowed"
            >
                Class Filled Up
            </button>
        );
    }

    return (
        <button
            onClick={handleEnroll}
            disabled={isPending}
            className={`w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-xs transition ${isPending ? "opacity-50 cursor-wait" : ""
                }`}
        >
            {isPending ? "Enrolling..." : "Commit & Enroll"}
        </button>
    );
}