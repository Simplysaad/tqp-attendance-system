import React, { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import "./globals.css";

export const metadata: Metadata = {
    title: 'TQP Attendance Tracking System',
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#2e7d32",
};

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-gray-50 text-gray-900 antialiased" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}