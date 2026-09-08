"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeStudentOnboarding } from "@/actions/student.action";

export default function StudentOnboardingForm({ userId }: { userId: string }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        const payload = {
            userId,
            gender: formData.get("gender") as "male" | "female",
            matricNumber: formData.get("matricNumber") as string,
            faculty: formData.get("faculty") as string,
            department: formData.get("department") as string,
            level: formData.get("level") ? Number(formData.get("level")) : undefined,
            currentMemorization: {
                surah: formData.get("surah") as string,
                aayah: formData.get("aayah") ? Number(formData.get("aayah")) : undefined,
                juz: formData.get("juz") ? Number(formData.get("juz")) : undefined,
                page: formData.get("page") ? Number(formData.get("page")) : undefined,
            },
        };

        const res = await completeStudentOnboarding(payload);

        if (!res.success) {
            setError(res.message || "An error occurred");
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-4 border rounded">
            <h2 className="text-xl font-bold">Student Onboarding</h2>
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
                <label className="block text-sm font-medium">Matric Number</label>
                <input type="text" name="matricNumber" className="w-full border p-2 rounded" />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm font-medium">Faculty</label>
                    <input type="text" name="faculty" className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Department</label>
                    <input type="text" name="department" className="w-full border p-2 rounded" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">Level</label>
                <input type="number" name="level" min={100} step={100} className="w-full border p-2 rounded" placeholder="e.g. 300" />
            </div>

            <fieldset className="border p-3 rounded space-y-2">
                <legend className="text-sm font-semibold">Current Memorization Status</legend>
                <input type="text" name="surah" placeholder="Surah (e.g. Al-Baqarah)" className="w-full border p-1 rounded text-sm" />
                <div className="grid grid-cols-3 gap-2">
                    <input type="number" name="aayah" placeholder="Aayah" min={1} className="border p-1 rounded text-sm" />
                    <input type="number" name="juz" placeholder="Juz (1-30)" min={1} max={30} className="border p-1 rounded text-sm" />
                    <input type="number" name="page" placeholder="Page (1-604)" min={1} max={604} className="border p-1 rounded text-sm" />
                </div>
            </fieldset>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
                {loading ? "Saving..." : "Complete Setup"}
            </button>
        </form>
    );
}