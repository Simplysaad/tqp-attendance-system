"use client";

import { useState, useEffect, useTransition } from "react";
import { activateNearestSchedule, getNearestSchedule } from "@/actions/tutor.action";

export default function ActivateNearestScheduleButton() {
    const [isPending, startTransition] = useTransition();
    const [isLinkActive, setIsLinkActive] = useState<boolean>(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
    const [activeInfo, setActiveInfo] = useState<string | null>(null);

    // Sync initial state on mount
    useEffect(() => {
        let isSubscribed = true;
        const fetchStatus = async () => {
            try {
                const res = await getNearestSchedule();
                if (isSubscribed && res.success) {
                    setIsLinkActive(res.data.status === "active");
                }
            } catch (error) {
                console.error("Failed to check schedule status", error);
            } finally {
                if (isSubscribed) setIsLoadingInitial(false);
            }
        };

        fetchStatus();
        return () => {
            isSubscribed = false;
        };
    }, []);

    const handleActivateToggle = () => {
        setActiveInfo(null);
        startTransition(async () => {
            const res = await activateNearestSchedule();

            if (res.success) {
                setIsLinkActive((prev) => !prev);
                setActiveInfo(res.message || (isLinkActive ? "Class link deactivated" : "Class link is now live"));
            } else if (res.error) {
                setActiveInfo(res.error);
            }
        });
    };

    if (isLoadingInitial) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-400 bg-gray-50 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                Checking status...
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end gap-1.5">
            <button
                onClick={handleActivateToggle}
                disabled={isPending}
                className={`relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed ${isPending
                    ? "bg-gray-100 text-gray-400 border border-gray-200"
                    : isLinkActive
                        ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 focus:ring-rose-400"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500"
                    }`}
            >
                {/* Status Indicator Dot / Spinner */}
                {isPending ? (
                    <svg
                        className="animate-spin h-4 w-4 text-gray-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                ) : isLinkActive ? (
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                ) : (
                    <span className="h-2 w-2 rounded-full bg-emerald-200"></span>
                )}

                {/* Button Text */}
                <span>
                    {isPending
                        ? isLinkActive
                            ? "Deactivating..."
                            : "Activating..."
                        : isLinkActive
                            ? "Deactivate Class Link"
                            : "Activate Class Link"}
                </span>
            </button>

            {/* Contextual Status Message */}
            {activeInfo && (
                <span
                    className={`text-xs font-medium ${activeInfo.toLowerCase().includes("error") || activeInfo.toLowerCase().includes("failed")
                        ? "text-rose-600"
                        : "text-emerald-700"
                        }`}
                >
                    {activeInfo}
                </span>
            )}
        </div>
    );
}