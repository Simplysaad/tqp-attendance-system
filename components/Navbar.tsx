"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BookOpen,
    LayoutDashboard,
    CalendarCheck,
    User,
    LogOut,
    Menu,
    X,
    ChevronDown,
} from "lucide-react";
import { getSession, logoutUser } from "@/actions/user.action";

interface UserProfile {
    name: string;
    email: string;
    role: "student" | "tutor";
    whatsappNumber?: string;
}

const Navbar = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Auth pages check
    const isAuthPage = pathname === "/login" || pathname === "/signup";

    // Mocked active user state (Set to `null` to test logged-out state)
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        getSession()
            .then((data) => {
                // // console.log("data", data)
                if (isMounted) {
                    // Ensure data matches UserProfile type or null
                    setUser(data as UserProfile | null);
                }
            })
            .catch((error) => {
                console.error("Failed to fetch session:", error);
                if (isMounted) setUser(null);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false; // Prevents state updates on unmounted components
        };
    }, []);

    const navLinks = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Attendance", href: "/attendance", icon: CalendarCheck },
    ];

    return (
        <header className="sticky top-0 z-50 bg-[#FBFBF9]/90 backdrop-blur-md border-b border-amber-900/10 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">

                    {/* Brand Logo */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-950 flex items-center justify-center text-amber-400 shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform border border-amber-500/30">
                                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg sm:text-xl tracking-tight text-emerald-950">
                                    TQP <span className="text-amber-600 font-serif font-normal text-base sm:text-lg">Portal</span>
                                </span>
                                <span className="text-[10px] tracking-widest uppercase font-medium text-emerald-800/70 -mt-1">
                                    Tajweed & Retention
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links (Only shown when authenticated and not on auth pages) */}
                        {!isAuthPage && user && (
                            <nav className="hidden md:flex items-center space-x-1">
                                {navLinks.map((link) => {
                                    const Icon = link.icon;
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${isActive
                                                ? "bg-emerald-900/10 text-emerald-950 border border-emerald-900/20 shadow-sm"
                                                : "text-emerald-900/70 hover:bg-emerald-900/5 hover:text-emerald-950"
                                                }`}
                                        >
                                            <Icon className="w-4 h-4 text-emerald-800" />
                                            <span>{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}
                    </div>

                    {/* Desktop Action CTAs / User Dropdown */}
                    <div className="hidden md:flex items-center gap-2 sm:gap-4">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-emerald-900/5 border border-transparent hover:border-emerald-900/10 transition cursor-pointer"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-emerald-950 text-amber-400 font-bold text-sm flex items-center justify-center shadow-sm">
                                        {user.name?.charAt(0)}
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-xs font-bold text-emerald-950 max-w-[120px] truncate">
                                            {user.name}
                                        </p>
                                        <span className="text-[10px] font-semibold tracking-wider text-amber-600 uppercase">
                                            {user.role}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        className={`w-4 h-4 text-emerald-800 transition-transform ${isProfileOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {/* Profile Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white text-gray-900 rounded-2xl shadow-xl border border-amber-900/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-4 py-3 border-b border-gray-100 bg-emerald-50/40">
                                            <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                                                Signed in as
                                            </p>
                                            <p className="text-xs font-bold text-emerald-950 truncate">
                                                {user.email}
                                            </p>
                                            {user.whatsappNumber && (
                                                <p className="text-[11px] text-emerald-800/70 mt-0.5">
                                                    {user.whatsappNumber}
                                                </p>
                                            )}
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-950 transition"
                                            >
                                                <User className="w-4 h-4 text-emerald-800" />
                                                <span>Account Profile</span>
                                            </Link>
                                        </div>

                                        <div className="border-t border-gray-100 pt-1">
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    logoutUser()
                                                    alert("Logging out...");
                                                }}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-3.5 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-emerald-950 hover:text-emerald-800 transition"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/enroll"
                                    className="px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-950 rounded-lg sm:rounded-xl shadow-lg shadow-emerald-950/15 border border-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Find a Tutor
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-xl text-emerald-950 hover:bg-emerald-900/5 transition"
                            aria-label="Toggle Navigation"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-amber-900/10 bg-[#FBFBF9] px-4 pt-3 pb-6 space-y-4">
                    {user && (
                        <div className="p-3 rounded-xl bg-emerald-900/5 border border-emerald-900/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-950 text-amber-400 flex items-center justify-center font-bold text-base shadow-sm">
                                {user.name.charAt(0)}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-emerald-950">{user.name}</p>
                                <p className="text-xs text-emerald-800/80">{user.email}</p>
                            </div>
                        </div>
                    )}

                    {!isAuthPage && user && (
                        <nav className="space-y-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${isActive
                                            ? "bg-emerald-900/10 text-emerald-950 border border-emerald-900/20"
                                            : "text-emerald-900/70 hover:bg-emerald-900/5 hover:text-emerald-950"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 text-emerald-800" />
                                        <span>{link.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    )}

                    {user ? (
                        <div className="pt-2 border-t border-amber-900/10 space-y-2">
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    alert("Logging out...");
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-rose-100 transition"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-emerald-950 border border-emerald-900/20 rounded-xl hover:bg-emerald-900/5 transition"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/enroll"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="py-2.5 text-center text-xs font-semibold uppercase tracking-wider bg-emerald-900 text-white rounded-xl hover:bg-emerald-950 transition shadow-sm"
                            >
                                Find a Tutor
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;