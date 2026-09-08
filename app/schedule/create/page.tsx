"use client";

import { useState, FormEvent } from "react";
import { createSchedule } from "@/actions/tutor.action";
import { timeStringToMinutes } from "@/lib/time";

export default function CreateScheduleForm() {
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
        } else {
            alert(res.error || "Failed to create schedule.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md border p-6 rounded-lg bg-white">
            <h3 className="font-bold text-lg">Add New Slot</h3>

            <div>
                <label className="block text-sm font-medium">Day of Week</label>
                <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full border p-2 rounded"
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
                    <label className="block text-sm font-medium">Start Time</label>
                    <input
                        type="time"
                        value={startTimeStr}
                        onChange={(e) => setStartTimeStr(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium">End Time</label>
                    <input
                        type="time"
                        value={endTimeStr}
                        onChange={(e) => setEndTimeStr(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">Google Meet Link</label>
                <input
                    type="url"
                    value={googleMeetLink}
                    onChange={(e) => setGoogleMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full border p-2 rounded"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-2 rounded font-medium hover:bg-emerald-700"
            >
                {loading ? "Creating..." : "Save Schedule Slot"}
            </button>
        </form>
    );
}