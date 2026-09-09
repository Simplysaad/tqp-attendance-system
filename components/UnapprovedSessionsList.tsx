"use client";

import React from "react";
import Link from "next/link";
import { ISession } from "@/models/session.model";
import { ObjectId, Types } from "mongoose";

interface UnapprovedSessionItem extends ISession {
    _id: Types.ObjectId;
}

interface UnapprovedSessionsListProps {
    sessions: UnapprovedSessionItem[];
}

export default function UnapprovedSessionsList({ sessions }: UnapprovedSessionsListProps) {
    if (!sessions || sessions.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                <p className="text-sm text-gray-500">🎉 All caught up! No unapproved sessions pending.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-gray-900">Pending Verification</h3>
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
                    {sessions.length} Pending
                </span>
            </div>

            <div className="divide-y divide-gray-100">
                {sessions.map((session) => (
                    <Link
                        key={session._id.toString()}
                        href={`/dashboard/sessions/${session._id}`}
                        className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg transition group"
                    >
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-600 transition">
                                {session.name || "Student"}
                            </p>
                            <p className="text-xs text-gray-400">
                                Logged on {new Date(session.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 font-medium">
                                Verify Log
                            </span>
                            <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">➔</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}