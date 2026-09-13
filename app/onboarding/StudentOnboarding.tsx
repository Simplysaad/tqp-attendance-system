"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeStudentOnboarding } from "@/actions/student.action";
import SearchableSelect from "@/components/SearchableSelect";
import { QURAN_SURAHS } from "@/lib/surah";
import { IMemorization } from "@/models/student.model";



export interface FormState {
    gender: "male" | "female" | "";
    matricNumber: string;
    faculty: string;
    department: string;
    level: string | number;
    currentMemorization: IMemorization
    expectedMemorization: IMemorization
}

export default function StudentOnboardingForm({ userId }: { userId: string }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Controlled form state matching your payload structure
    const [formData, setFormData] = useState<FormState>({
        gender: "",
        matricNumber: "",
        faculty: "",
        department: "",
        level: "",
        currentMemorization: {
            surah: "",
            aayah: 0,
            juz: 0,
            page: 0,
        },
        expectedMemorization: {
            surah: "",
            aayah: 0,
            juz: 0,
            page: 0,
        },
    });

    // Universal change handler for flat inputs
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Change handler for nested memorization inputs
    const handleMemorizationChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            currentMemorization: {
                ...prev.currentMemorization,
                [name]: value,
            },
        }));
    };
    const handleGoalChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            expectedMemorization: {
                ...prev.expectedMemorization,
                [name]: value,
            },
        }));
    };

    // Direct change handler for custom components like SearchableSelect
    const handleSelectChange = (fieldName: keyof FormState, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value,
        }));
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        if (!formData.faculty) {
            setError("Please select a faculty.");
            return;
        }

        if (!formData.currentMemorization.surah) {
            setError("Please select a Surah.");
            return;
        }

        const payload = {
            userId,
            gender: formData.gender as "male" | "female",
            matricNumber: formData.matricNumber,
            faculty: formData.faculty,
            department: formData.department,
            level: formData.level ? Number(formData.level) : undefined,
            currentMemorization: {
                surah: formData.currentMemorization.surah,
                aayah: formData.currentMemorization.aayah
                    ? Number(formData.currentMemorization.aayah)
                    : undefined,
                juz: formData.currentMemorization.juz
                    ? Number(formData.currentMemorization.juz)
                    : undefined,
                page: formData.currentMemorization.page
                    ? Number(formData.currentMemorization.page)
                    : undefined,
            },
            expectedMemorization: {
                surah: formData.currentMemorization.surah,
                aayah: formData.currentMemorization.aayah
                    ? Number(formData.currentMemorization.aayah)
                    : undefined,
                juz: formData.currentMemorization.juz
                    ? Number(formData.currentMemorization.juz)
                    : undefined,
                page: formData.currentMemorization.page
                    ? Number(formData.currentMemorization.page)
                    : undefined,
            },
        };

        const res = await completeStudentOnboarding(payload);
        setLoading(true);

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
                <h2 className="text-2xl font-bold text-emerald-950">Student Onboarding</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Complete your academic profile and current Qur'an memorization progress.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Gender & Matric Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                            Gender *
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
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
                            Matric Number *
                        </label>
                        <input
                            type="text"
                            name="matricNumber"
                            value={formData.matricNumber}
                            onChange={handleChange}
                            required
                            placeholder="e.g. 21/15CD001"
                            className="w-full border border-emerald-900/20 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        />
                    </div>
                </div>

                {/* Faculty & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                            Faculty *
                        </label>
                        <SearchableSelect
                            required
                            name="faculty"
                            value={formData.faculty}
                            onChange={(val: string) => handleSelectChange("faculty", val)}
                            options={["tech", "science", "arts", "administration", "social sciences"]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                            Department *
                        </label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Civil Engineering"
                            className="w-full border border-emerald-900/20 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                        />
                    </div>
                </div>

                {/* Level */}
                <div>
                    <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                        Academic Level *
                    </label>
                    <input
                        type="number"
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        required
                        min={100}
                        step={100}
                        placeholder="e.g. 300"
                        className="w-full border border-emerald-900/20 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                </div>

                {/* Current Memorization Container */}
                <div className="p-4 border border-emerald-900/15 rounded-xl bg-emerald-50/50 space-y-3">
                    <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Current Memorization Status
                    </h3>

                    <div>
                        <SearchableSelect
                            required
                            placeholder="Current Surah *"
                            name="surah"
                            value={formData.currentMemorization.surah}
                            options={QURAN_SURAHS.map((surah) => surah.name)}
                            onChange={(val: string) => handleMemorizationChange("surah", val)}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                Aayah *
                            </label>
                            <input
                                type="number"
                                name="aayah"
                                value={formData.currentMemorization.aayah}
                                onChange={(e) => handleMemorizationChange(e.target.name, e.target.value)}
                                required
                                placeholder="e.g. 255"
                                min={1}
                                max={QURAN_SURAHS.find((surah) => surah.name === formData.currentMemorization.surah)?.totalAayahs}
                                className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                Juz (1-30)
                            </label>
                            <input
                                type="number"
                                name="juz"
                                value={formData.currentMemorization.juz}
                                onChange={(e) => handleMemorizationChange(e.target.name, e.target.value)}
                                placeholder="Juz"
                                min={1}
                                max={30}
                                className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                Page * (1-604)
                            </label>
                            <input
                                type="number"
                                name="page"
                                value={formData.currentMemorization.page}
                                onChange={(e) => handleMemorizationChange(e.target.name, e.target.value)}
                                required
                                placeholder="Page"
                                min={1}
                                max={604}
                                className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                            />
                        </div>
                    </div>
                </div>

                {/* Goal Memorization Container */}
                <div className="p-4 border border-emerald-900/15 rounded-xl bg-emerald-50/50 space-y-3">
                    <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Memorization Goal
                    </h3>

                    <div>
                        <SearchableSelect
                            required
                            placeholder="Current Surah *"
                            name="surah"
                            value={formData.expectedMemorization.surah}
                            options={QURAN_SURAHS.map((surah) => surah.name)}
                            onChange={(val: string) => handleGoalChange("surah", val)}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                Aayah *
                            </label>
                            <input
                                type="number"
                                name="aayah"
                                value={formData.expectedMemorization.aayah}
                                onChange={(e) => handleGoalChange(e.target.name, e.target.value)}
                                required
                                placeholder="e.g. 255"
                                min={1}
                                max={QURAN_SURAHS.find((surah) => surah.name === formData.expectedMemorization.surah)?.totalAayahs}
                                className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                Juz (1-30)
                            </label>
                            <input
                                type="number"
                                name="juz"
                                value={formData.expectedMemorization.juz}
                                onChange={(e) => handleGoalChange(e.target.name, e.target.value)}
                                placeholder="Juz"
                                min={1}
                                max={30}
                                className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                                Page * (1-604)
                            </label>
                            <input
                                type="number"
                                name="page"
                                value={formData.expectedMemorization.page}
                                onChange={(e) => handleGoalChange(e.target.name, e.target.value)}
                                required
                                placeholder="Page"
                                min={1}
                                max={604}
                                className="w-full border border-emerald-900/20 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
                            />
                        </div>
                    </div>
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