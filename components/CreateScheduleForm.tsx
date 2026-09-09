"use client";

import { useState, FormEvent } from "react";
import { createSchedule } from "@/actions/tutor.action";
import { timeStringToMinutes } from "@/lib/time";

interface CreateScheduleFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function CreateScheduleForm({ onSuccess, onCancel }: CreateScheduleFormProps) {
    const [dayOfWeek, setDayOfWeek] = useState("monday");
    const [startTimeStr, setStartTimeStr] = useState("10:00");
    const [endTimeStr, setEndTimeStr] = useState("11:00");
    const [googleMeetLink, setGoogleMeetLink] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const startTime = timeStringToMinutes(startTimeStr);
        const endTime = timeStringToMinutes(endTimeStr);

        if (startTime >= endTime) {
            alert("End time must be strictly after start time.");
            setLoading(false);
            return;
        }

        const res = await createSchedule({
            dayOfWeek: dayOfWeek as any,
            startTime,
            endTime,
            mode: "online",
            googleMeetLink,
        });

        setLoading(false);

        if (res.success) {
            alert("Schedule created successfully!");
            if (onSuccess) {
                onSuccess();
            } else {
                window.location.reload();
            }
        } else {
            alert(res.error || "Failed to create schedule.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div>
                <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                    Day of Week
                </label>
                <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full border border-emerald-900/20 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                </select>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                        Start Time
                    </label>
                    <input
                        type="time"
                        value={startTimeStr}
                        onChange={(e) => setStartTimeStr(e.target.value)}
                        className="w-full border border-emerald-900/20 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        required
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                        End Time
                    </label>
                    <input
                        type="time"
                        value={endTimeStr}
                        onChange={(e) => setEndTimeStr(e.target.value)}
                        className="w-full border border-emerald-900/20 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                    Google Meet Link
                </label>
                <input
                    type="url"
                    value={googleMeetLink}
                    onChange={(e) => setGoogleMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full border border-emerald-900/20 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    required
                />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2.5 text-xs font-semibold text-emerald-950 border border-emerald-900/20 rounded-xl hover:bg-emerald-900/5 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-emerald-900 text-white text-xs font-semibold rounded-xl hover:bg-emerald-950 transition disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-950/10"
                >
                    {loading ? "Saving..." : "Save Schedule Slot"}
                </button>
            </div>
        </form>
    );
}