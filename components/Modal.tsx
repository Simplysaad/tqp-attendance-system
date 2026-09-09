"use client";

import React, { useEffect, ReactNode } from "react";
import { X } from "lucide-react";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children?: ReactNode;
    // CTA Button Props
    ctaText?: string;
    onCtaClick?: () => void | Promise<void>;
    ctaVariant?: "primary" | "danger" | "amber";
    isCtaLoading?: boolean;
    // Cancel Button Props
    cancelText?: string;
    onCancel?: () => void;
    showCancelButton?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    ctaText = "Confirm",
    onCtaClick,
    ctaVariant = "primary",
    isCtaLoading = false,
    cancelText = "Cancel",
    onCancel,
    showCancelButton = true,
}: ModalProps) {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Handle Close & optional custom onCancel callback
    const handleClose = () => {
        onClose(); // Always closes modal first
        if (onCancel) {
            onCancel(); // Fires custom callback after modal close trigger
        }
    };

    // Close on ESC keypress
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                handleClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    // CTA variant styling maps
    const ctaStyles = {
        primary: "bg-emerald-900 hover:bg-emerald-950 text-white border-amber-500/20 shadow-emerald-950/15",
        danger: "bg-rose-600 hover:bg-rose-700 text-white border-rose-500/20 shadow-rose-950/15",
        amber: "bg-amber-500 hover:bg-amber-400 text-emerald-950 border-amber-600/20 shadow-amber-500/15 font-bold",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop: Blurs background content instead of hiding it */}
            <div
                className="fixed inset-0 bg-emerald-950/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-lg bg-[#FBFBF9] rounded-2xl sm:rounded-3xl border border-amber-900/10 shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
                {/* Close (X) Icon */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-emerald-900/60 hover:text-emerald-950 hover:bg-emerald-900/5 transition cursor-pointer"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Section */}
                {(title || subtitle) && (
                    <div className="mb-5 pr-6">
                        {title && (
                            <h3 className="text-lg sm:text-xl font-bold text-emerald-950 tracking-tight">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-xs sm:text-sm text-emerald-800/80 mt-1 leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}

                {/* Modal Body / Children */}
                {children && <div className="mb-6 text-sm text-gray-700">{children}</div>}

                {/* Action Buttons Footer */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-2">
                    {showCancelButton && (
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-950 hover:bg-emerald-900/5 border border-emerald-900/15 rounded-xl transition cursor-pointer"
                        >
                            {cancelText}
                        </button>
                    )}

                    {onCtaClick && (
                        <button
                            type="button"
                            disabled={isCtaLoading}
                            onClick={onCtaClick}
                            className={`w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl shadow-lg border transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${ctaStyles[ctaVariant]}`}
                        >
                            {isCtaLoading ? "Processing..." : ctaText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}