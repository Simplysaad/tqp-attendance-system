"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/user.action";
import { IUser } from "@/models/user.model";
import {
    BookOpen,
    GraduationCap,
    Lock,
    Mail,
    User,
    Phone,
    ShieldCheck,
    ArrowRight,
    Loader2,
} from "lucide-react";

const RegisterPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<IUser>({
        name: "",
        email: "",
        whatsappNumber: "",
        password: "",
        role: "student",
        isActive: true,
    });

    const [loading, setLoading] = useState<boolean>(false);

    // Generic change handler for inputs
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Dedicated handler for button role selection
    const handleRoleSelect = (selectedRole: "student" | "tutor") => {
        setFormData((prevData) => ({
            ...prevData,
            role: selectedRole,
        }));
    };

    // Form submission handler
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await registerUser(formData);

            console.log("response", response);
            if (response.success) {
                console.log("Registration successful:", response.user);
                alert("Registration successful!");

                // Reset form after successful submission
                setFormData({
                    ...formData,
                    name: "",
                    email: "",
                    whatsappNumber: "",
                    password: "",
                });

                router.push("/onboarding");
            } else {
                console.error("Error registering user:", response.error);
                alert(
                    response.error || "Registration failed. Please try again."
                );
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            alert("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-amber-100 selection:text-amber-900">
            {/* Header / Brand */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 px-4">
                <Link href="/" className="inline-flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-950 flex items-center justify-center text-amber-400 shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform border border-amber-500/30">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-emerald-950">
                        TQP <span className="text-amber-600 font-serif font-normal text-xl">Portal</span>
                    </span>
                </Link>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-950 font-serif">
                    Create Your Account
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                    Begin your structured Qur&apos;an memorisation journey today.
                </p>
            </div>

            {/* Main Form Container */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-emerald-950/5 rounded-2xl border border-amber-900/10 space-y-6">
                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {/* Interactive Role Selector Buttons */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                                I am registering as a
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect("student")}
                                    className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl cursor-pointer text-center transition-all ${formData.role === "student"
                                            ? "border-2 border-emerald-900 bg-emerald-50/60 text-emerald-950 shadow-sm"
                                            : "border border-gray-200 hover:border-emerald-700/40 bg-white text-gray-600 hover:text-emerald-950"
                                        }`}
                                >
                                    <GraduationCap
                                        className={`w-5 h-5 mb-1 transition-colors ${formData.role === "student"
                                                ? "text-emerald-900"
                                                : "text-gray-400"
                                            }`}
                                    />
                                    <span className="text-xs font-bold">Student</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleRoleSelect("tutor")}
                                    className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl cursor-pointer text-center transition-all ${formData.role === "tutor"
                                            ? "border-2 border-emerald-900 bg-emerald-50/60 text-emerald-950 shadow-sm"
                                            : "border border-gray-200 hover:border-emerald-700/40 bg-white text-gray-600 hover:text-emerald-950"
                                        }`}
                                >
                                    <BookOpen
                                        className={`w-5 h-5 mb-1 transition-colors ${formData.role === "tutor"
                                                ? "text-emerald-900"
                                                : "text-gray-400"
                                            }`}
                                    />
                                    <span className="text-xs font-bold">Ustadh / Tutor</span>
                                </button>
                            </div>
                        </div>

                        {/* Full Name Input */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                            >
                                Full Name
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your full name"
                                    className="block w-full pl-10 pr-3 py-2.5 sm:py-3 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* Email Address Input */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                            >
                                Email Address
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="example@email.com"
                                    className="block w-full pl-10 pr-3 py-2.5 sm:py-3 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* WhatsApp Number Input */}
                        <div>
                            <label
                                htmlFor="whatsappNumber"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                            >
                                WhatsApp Number
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <input
                                    type="tel"
                                    id="whatsappNumber"
                                    name="whatsappNumber"
                                    value={formData.whatsappNumber}
                                    onChange={handleChange}
                                    required
                                    placeholder="+1234567890"
                                    className="block w-full pl-10 pr-3 py-2.5 sm:py-3 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
                            >
                                Password
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your password"
                                    className="block w-full pl-10 pr-3 py-2.5 sm:py-3 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-emerald-900 hover:bg-emerald-950 disabled:bg-emerald-900/70 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-950/15 border border-amber-500/20 flex items-center justify-center gap-2 transition-all hover:gap-3 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <span>Submit</span>
                                    <ArrowRight className="w-4 h-4 text-amber-400" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-bold text-emerald-900 hover:text-emerald-950 hover:underline transition"
                        >
                            Sign In Here
                        </Link>
                    </div>
                </div>

                {/* Security Note */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    <span>Protected with secure authentication & session logging</span>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;