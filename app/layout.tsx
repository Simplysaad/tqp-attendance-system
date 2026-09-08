import React, { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import "./index.css";

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
        <html lang="en">
            <body>
                <div>{children}</div>
            </body>
        </html>
    );
}