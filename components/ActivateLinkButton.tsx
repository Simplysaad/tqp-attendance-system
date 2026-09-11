"use client";

import { useState, useEffect, useTransition } from "react";
import { activateNearestSchedule, getNearestSchedule } from "@/actions/tutor.action";
import { IScheduleDocument } from "@/models/schedule.model";

export default function ActivateNearestScheduleButton() {
    const [isPending, startTransition] = useTransition();
    const [isLinkActive, setIsLinkActive] = useState<boolean>(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
    const [activeInfo, setActiveInfo] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [scheduleData, setScheduleData] = useState<IScheduleDocument | null>(null);

    // Sync initial state on mount
    useEffect(() => {
        let isSubscribed = true;

        const fetchStatus = async () => {
            try {
                const res = await getNearestSchedule();

                if (isSubscribed && res?.success && res.data) {
                    setIsLinkActive(res.data.status === "active");
                    setScheduleData(res.data);
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
            try {
                const res = await activateNearestSchedule();

                if (res?.success) {
                    setIsLinkActive((prev) => !prev);
                    if (res.data) setScheduleData(res.data);
                    setActiveInfo(
                        res.message || (isLinkActive ? "Class link deactivated" : "Class link is now live")
                    );
                } else {
                    setActiveInfo(res?.error || "Failed to update schedule status.");
                }
            } catch (error) {
                console.error("Failed to toggle schedule", error);
                setActiveInfo("An unexpected error occurred.");
            }
        });
    };

    const handleShare = async () => {
        const shareUrl =
            scheduleData?.pseudoLink ||
            (scheduleData?._id
                ? `${window.location.origin}/join/${scheduleData._id}`
                : window.location.origin);

        const shareData = {
            title: "Class Link",
            text: "Join my live class session:",
            url: shareUrl,
        };

        // Helper function to reliably copy to clipboard
        const copyToClipboard = async () => {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy link", err);
            }
        };

        // Only use navigator.share on mobile devices where native share sheets are reliable
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                // If user canceled the mobile share modal, do nothing
                if ((err as Error).name === "AbortError") return;
            }
        }

        // Desktop or unsupported browser fallback -> Always Copy to Clipboard
        await copyToClipboard();
    };



    if (isLoadingInitial) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-400 bg-gray-50 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                Checking status...
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end gap-1.5">
            <div className="inline-flex rounded-md shadow-sm">
                {/* Main Activation Toggle Button */}
                <button
                    type="button"
                    onClick={handleActivateToggle}
                    disabled={isPending}
                    className={`relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-l-md border transition-all focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed ${isPending
                        ? "bg-gray-100 text-gray-400 border-gray-200"
                        : isLinkActive
                            ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 focus:ring-rose-400"
                            : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
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
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    ) : isLinkActive ? (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                        </span>
                    ) : (
                        <span className="h-2 w-2 rounded-full bg-emerald-200" />
                    )}

                    {/* Button Label */}
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

                {/* Secondary Share/Copy Button */}
                <button
                    type="button"
                    onClick={handleShare}
                    title={copied ? "Copied!" : "Share Link"}
                    className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-medium rounded-r-md border transition-all focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-1 ${isPending
                        ? "bg-gray-100 text-gray-400 border-gray-200"
                        : isLinkActive
                            ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 border-l-rose-200/60 focus:ring-rose-400"
                            : "bg-emerald-600 text-white border-emerald-600 border-l-emerald-700/50 hover:bg-emerald-700 focus:ring-emerald-500"
                        }`}
                >
                    {copied ? (
                        <span className="text-xs font-semibold animate-in fade-in">Copied!</span>
                    ) : (
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                        </svg>
                    )}
                </button>
            </div>

            {/* Contextual Status Message */}
            {activeInfo && (
                <span
                    className={`text-xs font-medium ${activeInfo.toLowerCase().includes("error") ||
                        activeInfo.toLowerCase().includes("failed")
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