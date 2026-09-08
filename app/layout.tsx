import React, { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'TQP Attendance Tracking System',
    viewport: 'width=device-width, initial-scale=1.0',
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