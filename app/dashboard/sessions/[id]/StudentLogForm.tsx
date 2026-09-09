"use client";

import React, { useState, useMemo } from "react";
import SearchableSelect from "@/components/SearchableSelect"; // Adjust import path if needed
import { logStudentProgress } from "@/actions/session.action";
import { QURAN_SURAHS } from "@/lib/surah"; // Assumed format: [{ id: number, name: string, totalAayahs: number }, ...]

interface LogProgressFormProps {
    sessionId: string;
    studentId: string;
    onSuccess?: () => void;
}

interface QuranPositionState {
    surah: string;
    aayah: number | "";
    page: number | "";
}

export default function LogProgressForm({ sessionId, studentId, onSuccess }: LogProgressFormProps) {
    // --- Form State ---
    const [startPos, setStartPos] = useState<QuranPositionState>({ surah: "", aayah: "", page: "" });
    const [endPos, setEndPos] = useState<QuranPositionState>({ surah: "", aayah: "", page: "" });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Convert surah list to SearchableSelect options
    const surahOptions = useMemo(() => {
        return QURAN_SURAHS.map((s) => ({
            label: `${s.number}. ${s.name} (${s.totalAayahs} Ayahs)`,
            value: s.name,
        }));
    }, []);

    // Helper to get total Ayahs for a selected Surah
    const getMaxAyahs = (surahName: string): number => {
        const found = QURAN_SURAHS.find((s) => s.name.toLowerCase() === surahName.toLowerCase());
        return found ? found.totalAayahs : 286;
    };

    const startMaxAyahs = useMemo(() => getMaxAyahs(startPos.surah), [startPos.surah]);
    const endMaxAyahs = useMemo(() => getMaxAyahs(endPos.surah), [endPos.surah]);

    // --- Handlers ---
    const handleStartSurahChange = (val: string) => {
        setStartPos((prev) => ({
            ...prev,
            surah: val,
            // Reset Aayah if current selection exceeds new max
            aayah: prev.aayah !== "" && Number(prev.aayah) > getMaxAyahs(val) ? "" : prev.aayah,
        }));
    };

    const handleEndSurahChange = (val: string) => {
        setEndPos((prev) => ({
            ...prev,
            surah: val,
            aayah: prev.aayah !== "" && Number(prev.aayah) > getMaxAyahs(val) ? "" : prev.aayah,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        // Validation
        if (!startPos.surah || !endPos.surah) {
            setError("Please select both starting and ending Surahs.");
            return;
        }

        if (startPos.aayah === "" || endPos.aayah === "") {
            setError("Please specify the starting and ending Aayah numbers.");
            return;
        }

        setLoading(true);

        const payload = {
            sessionId,
            studentId,
            newMemorization: {
                start: {
                    surah: startPos.surah,
                    aayah: Number(startPos.aayah),
                    page: startPos.page !== "" ? Number(startPos.page) : undefined,
                },
                end: {
                    surah: endPos.surah,
                    aayah: Number(endPos.aayah),
                    page: endPos.page !== "" ? Number(endPos.page) : undefined,
                },
            },
        };

        const res = await logStudentProgress(payload);
        setLoading(false);

        if (res.success) {
            setSuccessMsg("Memorization progress submitted for tutor verification!");
            if (onSuccess) onSuccess();
        } else {
            setError(res.error || "Failed to log progress.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Log Today's Memorization</h3>
                <p className="text-sm text-gray-500">Record the range of verses you recited in class for your tutor to verify.</p>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                    {successMsg}
                </div>
            )}

            {/* --- START POSITION --- */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Start Position</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Surah *</label>
                        <SearchableSelect
                            options={surahOptions}
                            value={startPos.surah}
                            onChange={handleStartSurahChange}
                            placeholder="Select Surah..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Aayah * {startPos.surah && <span className="text-gray-400">(Max: {startMaxAyahs})</span>}
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={startMaxAyahs}
                            value={startPos.aayah}
                            onChange={(e) => setStartPos({ ...startPos, aayah: e.target.value === "" ? "" : Number(e.target.value) })}
                            placeholder={`1 - ${startMaxAyahs}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Page (Optional)</label>
                        <input
                            type="number"
                            min={1}
                            max={604}
                            value={startPos.page}
                            onChange={(e) => setStartPos({ ...startPos, page: e.target.value === "" ? "" : Number(e.target.value) })}
                            placeholder="1 - 604"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                        />
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* --- END POSITION --- */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">End Position</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Surah *</label>
                        <SearchableSelect
                            options={surahOptions}
                            value={endPos.surah}
                            onChange={handleEndSurahChange}
                            placeholder="Select Surah..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Aayah * {endPos.surah && <span className="text-gray-400">(Max: {endMaxAyahs})</span>}
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={endMaxAyahs}
                            value={endPos.aayah}
                            onChange={(e) => setEndPos({ ...endPos, aayah: e.target.value === "" ? "" : Number(e.target.value) })}
                            placeholder={`1 - ${endMaxAyahs}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Page (Optional)</label>
                        <input
                            type="number"
                            min={1}
                            max={604}
                            value={endPos.page}
                            onChange={(e) => setEndPos({ ...endPos, page: e.target.value === "" ? "" : Number(e.target.value) })}
                            placeholder="1 - 604"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition duration-150 disabled:opacity-50 text-sm"
            >
                {loading ? "Submitting Log..." : "Submit Progress for Verification"}
            </button>
        </form>
    );
}