"use client";

import React, { useState, ChangeEvent, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/actions/user.action";
import {
    BookOpen,
    Lock,
    Mail,
    ShieldCheck,
    ArrowRight,
    Loader2,
} from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

function LoginFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get("next");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await loginUser(formData.email, formData.password);

            if (response.success) {
                setFormData({ email: "", password: "" });
                router.push(next || "/dashboard");
            } else {
                alert(response.error || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            alert("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : "/register";

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
                    Welcome Back
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                    Enter your credentials to access your portal & Class.
                </p>
            </div>

            {/* Main Form Container */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
                <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-emerald-950/5 rounded-2xl border border-amber-900/10 space-y-6">
                    <form className="space-y-5" onSubmit={handleSubmit}>
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
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your password"
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
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Login</span>
                                    <ArrowRight className="w-4 h-4 text-amber-400" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-600">
                        Don&apos;t have an account yet?{" "}
                        <Link
                            href={registerHref}
                            className="font-bold text-emerald-900 hover:text-emerald-950 hover:underline transition"
                        >
                            Register Here
                        </Link>
                    </div>
                </div>

                {/* Security Note */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    <span>Encrypted end-to-end portal authentication</span>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-900" />
            </div>
        }>
            <LoginFormContent />
        </Suspense>
    );
}