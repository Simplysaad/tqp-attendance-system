"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeTutorOnboarding, CreateScheduleInput } from "@/actions/tutor.action";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export default function TutorOnboardingForm({ userId }: { userId: string }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [schedules, setSchedules] = useState<CreateScheduleInput[]>([
        { dayOfWeek: "monday", startTimeStr: "09:00", endTimeStr: "17:00", mode: "online", googleMeetLink: "" },
    ]);

    const addSlot = () => {
        setSchedules([...schedules, { dayOfWeek: "monday", startTimeStr: "09:00", endTimeStr: "17:00", googleMeetLink: "", mode: "online" }]);
    };

    const removeSlot = (index: number) => {
        setSchedules(schedules.filter((_, i) => i !== index));
    };

    const updateSlot = (index: number, field: keyof CreateScheduleInput, value: string) => {
        const updated = [...schedules];
        updated[index] = { ...updated[index], [field]: value };
        setSchedules(updated);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        const payload = {
            userId,
            gender: formData.get("gender") as "male" | "female",
            maximumStudents: formData.get("maximumStudents") ? Number(formData.get("maximumStudents")) : 5,
            schedules,
        };

        const res = await completeTutorOnboarding(payload);

        if (!res.success) {
            setError(res.message || "An error occurred");
            setLoading(false);
        } else {
            router.push("/dashboard?from=tutor_onboarding");
        }
    }

    return (
        <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-white border border-emerald-900/15 rounded-2xl shadow-xs space-y-6">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-emerald-950">Tutor Onboarding</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Set up your gender profile, capacity limits, and general weekly availability windows.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Gender & Student Capacity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1.5">
                            Gender *
                        </label>
                        <select
                            name="gender"
                            required
                            className="w-full border border-emerald-900/20 p-2.5 rounded-xl text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1.5">
                            Max Student Capacity *
                        </label>
                        <input
                            type="number"
                            name="maximumStudents"
                            defaultValue={5}
                            min={3}
                            required
                            className="w-full border border-emerald-900/20 p-2.5 rounded-xl text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        />
                    </div>
                </div>

                {/* Weekly Availability Section */}
                <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Set Your Schedules
                    </label>

                    <div className="space-y-3">
                        {schedules.map((slot, index) => (
                            <div
                                key={index}
                                className="flex flex-col gap-3 p-3.5 sm:p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 transition-all hover:border-emerald-200 hover:bg-emerald-50/50"
                            >
                                {/* Top Row: Day Selector & Time Inputs */}
                                <div className="flex flex-wrap items-center justify-between gap-2.5">
                                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                        {/* Day Dropdown */}
                                        <select
                                            value={slot.dayOfWeek}
                                            onChange={(e) => updateSlot(index, "dayOfWeek", e.target.value)}
                                            className="capitalize px-3 py-1.5 rounded-lg border border-emerald-900/20 bg-white text-xs font-semibold text-emerald-950 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 cursor-pointer"
                                        >
                                            {DAYS.map((d) => (
                                                <option key={d} value={d}>
                                                    {d}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Time Picker Range */}
                                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-emerald-900/20">
                                            <input
                                                type="time"
                                                value={slot.startTimeStr}
                                                onChange={(e) => updateSlot(index, "startTimeStr", e.target.value)}
                                                required
                                                className="text-xs font-medium text-slate-700 focus:outline-none bg-transparent cursor-pointer"
                                            />

                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-900/60 px-0.5">
                                                to
                                            </span>

                                            <input
                                                type="time"
                                                value={slot.endTimeStr}
                                                onChange={(e) => updateSlot(index, "endTimeStr", e.target.value)}
                                                required
                                                className="text-xs font-medium text-slate-700 focus:outline-none bg-transparent cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Remove Slot Action */}
                                    {schedules.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSlot(index)}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors ml-auto sm:ml-0 cursor-pointer"
                                        >
                                            <svg
                                                className="w-3.5 h-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                            <span>Remove</span>
                                        </button>
                                    )}
                                </div>

                                {/* Bottom Row: Meeting Link Input */}
                                <div className="flex flex-col gap-1.5 pt-1.5 border-t border-emerald-900/10">
                                    <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-950/80">
                                        Meeting Link <span className="normal-case font-normal text-slate-500">(Google Meet, WhatsApp call link)</span>
                                    </label>

                                    <input
                                        type="url"
                                        placeholder="https://meet.google.com/abc-defg-hij"
                                        value={slot.googleMeetLink}
                                        onChange={(e) => updateSlot(index, "googleMeetLink", e.target.value)}
                                        required
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-emerald-900/20 bg-white text-slate-800 placeholder:text-slate-400 focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 transition-all"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addSlot}
                        className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition inline-flex items-center gap-1 cursor-pointer pt-1"
                    >
                        + Add another Schedule
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-emerald-950 transition disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-950/10"
                >
                    {loading ? "Saving Setup..." : "Complete Setup"}
                </button>
            </form>
        </div>
    );
}