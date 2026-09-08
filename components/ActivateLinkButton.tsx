"use client";

import { useState, useTransition } from "react";
import { activateNearestSchedule } from "@/actions/tutor.action";

export default function ActivateNearestScheduleButton() {
    const [isPending, startTransition] = useTransition();
    const [activeInfo, setActiveInfo] = useState<string | null>(null);

    const handleActivate = () => {
        startTransition(async () => {
            const res = await activateNearestSchedule();

            if (res.success) {
                setActiveInfo(res.message || "Schedule status updated");
            } else if (res.error) {
                alert(res.error);
            }
        });
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                onClick={handleActivate}
                disabled={isPending}
                className={`px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition ${isPending ? "opacity-50 cursor-not-allowed" : ""
                    }`}
            >
                {isPending ? "Finding & Activating..." : "Activate Link"}
            </button>

            {activeInfo && (
                <span className="text-xs text-emerald-800 font-medium">
                    {activeInfo}
                </span>
            )}
        </div>
    );
}