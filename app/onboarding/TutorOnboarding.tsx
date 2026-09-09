"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeTutorOnboarding, AvailabilityInput } from "@/actions/tutor.action";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export default function TutorOnboardingForm({ userId }: { userId: string }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [availability, setAvailability] = useState<AvailabilityInput[]>([
        { dayOfWeek: "monday", startTimeStr: "09:00", endTimeStr: "17:00" },
    ]);

    const addSlot = () => {
        setAvailability([...availability, { dayOfWeek: "monday", startTimeStr: "09:00", endTimeStr: "17:00" }]);
    };

    const removeSlot = (index: number) => {
        setAvailability(availability.filter((_, i) => i !== index));
    };

    const updateSlot = (index: number, field: keyof AvailabilityInput, value: string) => {
        const updated = [...availability];
        updated[index] = { ...updated[index], [field]: value };
        setAvailability(updated);
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
            availability,
        };

        const res = await completeTutorOnboarding(payload);

        if (!res.success) {
            setError(res.message || "An error occurred");
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    }

    return (
        <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-white border border-emerald-900/15 rounded-2xl shadow-sm space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-emerald-950">Tutor Onboarding</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Set up your gender profile, capacity limits, and general weekly availability windows.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Gender & Student Capacity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                            Gender *
                        </label>
                        <select
                            name="gender"
                            required
                            className="w-full border border-emerald-900/20 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                            Max Student Capacity *
                        </label>
                        <input
                            type="number"
                            name="maximumStudents"
                            defaultValue={5}
                            min={3}
                            required
                            className="w-full border border-emerald-900/20 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        />
                    </div>
                </div>

                {/* Weekly Availability Section */}
                <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Weekly Availability Windows
                    </label>

                    <div className="space-y-2.5">
                        {availability.map((slot, index) => (
                            <div
                                key={index}
                                className="flex flex-wrap items-center gap-2 p-3 border border-emerald-900/15 rounded-xl bg-emerald-50/40"
                            >
                                <select
                                    value={slot.dayOfWeek}
                                    onChange={(e) => updateSlot(index, "dayOfWeek", e.target.value)}
                                    className="capitalize border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                                >
                                    {DAYS.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="time"
                                    value={slot.startTimeStr}
                                    onChange={(e) => updateSlot(index, "startTimeStr", e.target.value)}
                                    required
                                    className="border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                                />

                                <span className="text-xs text-emerald-950 font-medium">to</span>

                                <input
                                    type="time"
                                    value={slot.endTimeStr}
                                    onChange={(e) => updateSlot(index, "endTimeStr", e.target.value)}
                                    required
                                    className="border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                                />

                                {availability.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSlot(index)}
                                        className="ml-auto text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addSlot}
                        className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition inline-flex items-center gap-1 cursor-pointer pt-1"
                    >
                        + Add another window
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-900 text-white text-sm font-semibold rounded-xl hover:bg-emerald-950 transition disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-950/10"
                >
                    {loading ? "Saving Setup..." : "Complete Setup"}
                </button>
            </form>
        </div>
    );
}