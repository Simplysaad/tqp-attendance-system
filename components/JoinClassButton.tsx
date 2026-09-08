"use client";

interface StudentJoinClassButtonProps {
    isLinkActive: boolean;
    meetLinkAvailable: boolean;
}

export default function JoinClassButton({
    isLinkActive,
    meetLinkAvailable,
}: StudentJoinClassButtonProps) {
    if (isLinkActive && meetLinkAvailable) {
        return (
            <a
                href="/api/join-session"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-semibold shadow-sm transition flex items-center gap-2"
            >
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                Join Live Class
            </a>
        );
    }

    return (
        <button
            disabled
            className="px-4 py-2.5 bg-gray-200 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed border border-gray-300"
        >
            Link Not Activated
        </button>
    );
}