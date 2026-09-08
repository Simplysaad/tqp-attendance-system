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
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4 p-4 border rounded">
            <h2 className="text-xl font-bold">Tutor Onboarding</h2>
            {error && <p className="text-red-500">{error}</p>}

            <div>
                <label className="block text-sm font-medium">Gender *</label>
                <select name="gender" required className="w-full border p-2 rounded">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium">Maximum Students Capacity *</label>
                <input type="number" name="maximumStudents" defaultValue={5} min={3} required className="w-full border p-2 rounded" />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Weekly Availability</label>
                {availability.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 border p-2 rounded">
                        <select
                            value={slot.dayOfWeek}
                            onChange={(e) => updateSlot(index, "dayOfWeek", e.target.value)}
                            className="border p-1 rounded"
                        >
                            {DAYS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <input
                            type="time"
                            value={slot.startTimeStr}
                            onChange={(e) => updateSlot(index, "startTimeStr", e.target.value)}
                            required
                            className="border p-1 rounded"
                        />
                        <span>to</span>
                        <input
                            type="time"
                            value={slot.endTimeStr}
                            onChange={(e) => updateSlot(index, "endTimeStr", e.target.value)}
                            required
                            className="border p-1 rounded"
                        />
                        {availability.length > 1 && (
                            <button type="button" onClick={() => removeSlot(index)} className="text-red-500 text-sm">
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addSlot} className="text-sm text-blue-600 underline">
                    + Add another slot
                </button>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
                {loading ? "Saving..." : "Complete Setup"}
            </button>
        </form>
    );
}