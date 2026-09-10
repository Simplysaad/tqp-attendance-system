// components/PasswordInput.tsx
"use client";

import React, { useState, InputHTMLAttributes } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    id?: string;
    name?: string;
}

export function PasswordInput({ className = "", ...props }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative rounded-xl shadow-sm">
            {/* Left Lock Icon */}
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
            </div>

            {/* Input Field */}
            <input
                {...props}
                type={showPassword ? "text" : "password"}
                className={`block w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition ${className}`}
            />

            {/* Right Eye Toggle Button */}
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                ) : (
                    <Eye className="w-4 h-4" />
                )}
            </button>
        </div>
    );
}