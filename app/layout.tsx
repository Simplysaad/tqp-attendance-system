import React, { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
    title: "TQP Attendance Tracking System",
    description: "Structured Qur'an memorisation & attendance tracking portal.",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#022c22", // Emerald 950
};

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className="min-h-screen flex flex-col bg-[#FBFBF9] text-gray-900 antialiased selection:bg-amber-100 selection:text-amber-900"
                suppressHydrationWarning
            >
                {/* Navigation Bar */}
                <Navbar />

                {/* Main Content Area */}
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </main>
            </body>
        </html>
    );
}