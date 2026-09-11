import React from "react";
import Link from "next/link";
import {
    BookOpen,
    CalendarCheck,
    CheckCircle2,
    Clock,
    ShieldCheck,
    Users,
    Video,
    ArrowRight,
    GraduationCap,
    ChevronRight,
    FileCheck2,
    Activity,
    Compass,
    Layers,
    UserCheck,
    LogIn,
    MessageSquare,
    AlertCircle,
    Building2,
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#FBFBF9] text-gray-900 selection:bg-amber-100 selection:text-amber-900 font-sans antialiased">
            {/* =========================================================================
              HEADER / NAVIGATION
             ========================================================================= */}
            <header className="sticky top-0 z-50 bg-[#FBFBF9]/90 backdrop-blur-md border-b border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-amber-400 shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform border border-amber-500/30">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-bold text-xl tracking-tight text-emerald-950 block leading-tight">
                                TQP
                            </span>
                            <span className="text-[10px] sm:text-xs font-medium text-emerald-800/80 uppercase tracking-wider block">
                                Islamic Affairs Board • MSSN OAU
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link
                            href="#how-it-works"
                            className="hidden md:inline-flex text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-950 transition-colors"
                        >
                            How It Works
                        </Link>
                        <Link
                            href="#programme-value"
                            className="hidden md:inline-flex text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-950 transition-colors"
                        >
                            Accountability
                        </Link>
                        <Link
                            href="/login"
                            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-gray-300 text-emerald-950 font-semibold text-xs sm:text-sm hover:bg-emerald-50 transition flex items-center gap-2"
                        >
                            <LogIn className="w-4 h-4 text-emerald-800" />
                            <span>Log in</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* =========================================================================
              HERO SECTION: Institutional Programme Identity
             ========================================================================= */}
            <section className="relative overflow-hidden pt-8 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32">
                {/* Subtle Decorative Background Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 sm:w-150 h-75 sm:h-150 bg-emerald-900/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-10 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                        {/* Left Column: Programme Identity & Hero Direct CTAs */}
                        <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-8">

                            {/* Institutional Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/5 border border-emerald-900/15 text-emerald-950 text-xs sm:text-sm font-medium">
                                <Building2 className="w-4 h-4 text-emerald-800" />
                                <span>Islamic Affairs Board (IAB) • MSSN OAU</span>
                            </div>

                            {/* Main Headline */}
                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-emerald-950 leading-[1.15] font-serif">
                                Qur&apos;an Memorisation, Organised.
                            </h1>

                            {/* Structured Subtitle */}
                            <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                                The official digital infrastructure supporting the TQP programme. Structure, record, and monitor memorisation, revision, tutor-led classes, and attendance with complete accountability.
                            </p>

                            {/* Dual Audience Primary Actions */}
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                                <Link
                                    href="/register?role=student"
                                    className="w-full sm:w-auto px-7 py-4 bg-emerald-900 hover:bg-emerald-950 text-white font-semibold text-sm sm:text-base rounded-xl shadow-xl shadow-emerald-950/15 border border-amber-500/30 flex items-center justify-center gap-3 transition-all hover:gap-4"
                                >
                                    <GraduationCap className="w-5 h-5 text-amber-400" />
                                    <span>I&apos;m a Student</span>
                                    <ArrowRight className="w-4 h-4 text-amber-400" />
                                </Link>

                                <Link
                                    href="/register?role=tutor"
                                    className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-gray-50 text-emerald-950 font-semibold text-sm sm:text-base rounded-xl border border-gray-300 shadow-sm flex items-center justify-center gap-3 transition"
                                >
                                    <BookOpen className="w-5 h-5 text-emerald-800" />
                                    <span>I&apos;m a Tutor</span>
                                </Link>
                            </div>

                            {/* Quick Institutional Clarification */}
                            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 border-t border-gray-200/80 text-xs sm:text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                                    <span>Verified Programme Tutors</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-800" />
                                    <span>Centralised Progress Records</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Visual Artwork */}
                        <div className="lg:col-span-5 relative">
                            <div className="relative mx-auto max-w-md lg:max-w-none">
                                <div className="absolute -inset-1.5 bg-linear-to-tr from-amber-600/20 via-emerald-800/15 to-emerald-950/30 rounded-3xl blur-sm" />

                                <div className="relative bg-white border border-amber-900/10 rounded-2xl p-3 shadow-2xl overflow-hidden">
                                    <div className="relative h-72 sm:h-96 w-full rounded-xl bg-emerald-950 overflow-hidden flex items-center justify-center group">
                                        <img
                                            src="/images/hero-quran-majestic.jpg"
                                            alt="Structured Quran Memorisation Programme"
                                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-emerald-950 via-emerald-950/20 to-transparent" />

                                        {/* Live Programme Status Overlay */}
                                        <div className="absolute bottom-4 left-4 right-4 bg-emerald-950/90 backdrop-blur-md p-4 rounded-xl border border-amber-500/30 text-white flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                                                <div>
                                                    <p className="text-xs font-semibold text-amber-300">TQP Programme Portal</p>
                                                    <p className="text-[11px] text-gray-300">Class Schedules & Verified Records</p>
                                                </div>
                                            </div>
                                            <Clock className="w-5 h-5 text-amber-400/80" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* =========================================================================
              WHAT TQP SUPPORTS (THE DIGITAL INFRASTRUCTURE)
             ========================================================================= */}
            <section className="py-16 sm:py-24 bg-white border-y border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="text-center max-w-3xl mx-auto space-y-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">The Structure Behind TQP</span>
                        <h2 className="text-2xl sm:text-4xl font-bold text-emerald-950 font-serif tracking-tight">
                            Digital Infrastructure for Programme Execution
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            The platform does not replace tutors, circles, or mentorship. It provides the central framework that makes memorisation activity visible, documented, and accountable across the programme.
                        </p>
                    </div>

                    <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

                        {/* Pillar 1 */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-[#FBFBF9] border border-amber-900/10 hover:border-emerald-800/30 transition-all hover:shadow-lg group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-900/10 text-emerald-900 flex items-center justify-center mb-6 group-hover:bg-emerald-900 group-hover:text-amber-400 transition-colors">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-950 mb-2">Memorisation Tracking</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Students set and log clear memorisation goals, keeping a documented history of pages and Surahs mastered across sessions.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-[#FBFBF9] border border-amber-900/10 hover:border-emerald-800/30 transition-all hover:shadow-lg group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-900/10 text-emerald-900 flex items-center justify-center mb-6 group-hover:bg-emerald-900 group-hover:text-amber-400 transition-colors">
                                <Layers className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-950 mb-2">Revision Management</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Structured revision schedules run parallel to new memorisation, ensuring older portion retention is logged and evaluated.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-[#FBFBF9] border border-amber-900/10 hover:border-emerald-800/30 transition-all hover:shadow-lg group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-900/10 text-emerald-900 flex items-center justify-center mb-6 group-hover:bg-emerald-900 group-hover:text-amber-400 transition-colors">
                                <CalendarCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-950 mb-2">Class Schedules & Sessions</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Organised timetable management for tutor circles, allowing seamless coordination between Ustadhs and their assigned students.
                            </p>
                        </div>

                        {/* Pillar 4 */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-[#FBFBF9] border border-amber-900/10 hover:border-emerald-800/30 transition-all hover:shadow-lg group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-900/10 text-emerald-900 flex items-center justify-center mb-6 group-hover:bg-emerald-900 group-hover:text-amber-400 transition-colors">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-950 mb-2">Attendance Logging</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Replaces scattered or manual registers with structured digital attendance records for every active session.
                            </p>
                        </div>

                        {/* Pillar 5 */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-[#FBFBF9] border border-amber-900/10 hover:border-emerald-800/30 transition-all hover:shadow-lg group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-900/10 text-emerald-900 flex items-center justify-center mb-6 group-hover:bg-emerald-900 group-hover:text-amber-400 transition-colors">
                                <FileCheck2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-950 mb-2">Tutor Verification</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Students record session outcomes, and assigned tutors review and verify the submissions for accuracy and quality.
                            </p>
                        </div>

                        {/* Pillar 6 */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-[#FBFBF9] border border-amber-900/10 hover:border-emerald-800/30 transition-all hover:shadow-lg group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-900/10 text-emerald-900 flex items-center justify-center mb-6 group-hover:bg-emerald-900 group-hover:text-amber-400 transition-colors">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-950 mb-2">Monitoring & Intervention</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Clear progress metrics make it easy for programme coordinators to identify struggling students early and offer support.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* =========================================================================
              HOW TQP WORKS (PROGRAMME WORKFLOW)
             ========================================================================= */}
            <section id="how-it-works" className="py-16 sm:py-28 bg-[#FBFBF9] relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

                    <div className="text-center max-w-2xl mx-auto space-y-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Simple & Transparent</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-emerald-950 font-serif">How the Programme Works</h2>
                        <p className="text-sm text-gray-600">
                            A clear five-step operational cycle connecting students, tutors, and coordinators.
                        </p>
                    </div>

                    {/* Sequential Process Flow */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                        {/* 01 Join */}
                        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm relative flex flex-col justify-between">
                            <div>
                                <span className="text-2xl font-bold text-amber-600 font-serif block mb-2">01</span>
                                <h3 className="font-bold text-emerald-950 text-base mb-1">Join Your Class</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Access class and schedule links directly shared by your tutor or coordinator.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp link support</span>
                            </div>
                        </div>

                        {/* 02 Attend */}
                        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm relative flex flex-col justify-between">
                            <div>
                                <span className="text-2xl font-bold text-amber-600 font-serif block mb-2">02</span>
                                <h3 className="font-bold text-emerald-950 text-base mb-1">Attend Session</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Participate in your scheduled live class with your tutor and study circle.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                                <Video className="w-3.5 h-3.5" />
                                <span>Direct session links</span>
                            </div>
                        </div>

                        {/* 03 Record */}
                        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm relative flex flex-col justify-between">
                            <div>
                                <span className="text-2xl font-bold text-amber-600 font-serif block mb-2">03</span>
                                <h3 className="font-bold text-emerald-950 text-base mb-1">Record Progress</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Log attendance, pages recited, and revision coverage into your portal dashboard.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Fast submission</span>
                            </div>
                        </div>

                        {/* 04 Verify */}
                        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm relative flex flex-col justify-between">
                            <div>
                                <span className="text-2xl font-bold text-amber-600 font-serif block mb-2">04</span>
                                <h3 className="font-bold text-emerald-950 text-base mb-1">Tutor Verifies</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    The Ustadh reviews the entry, verifies recitation accuracy, and confirms attendance.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Tutor sign-off</span>
                            </div>
                        </div>

                        {/* 05 Progress */}
                        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm relative flex flex-col justify-between">
                            <div>
                                <span className="text-2xl font-bold text-amber-600 font-serif block mb-2">05</span>
                                <h3 className="font-bold text-emerald-950 text-base mb-1">Track Progress</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Verified records automatically build your cumulative TQP memorisation transcript.
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                                <Activity className="w-3.5 h-3.5" />
                                <span>Cumulative history</span>
                            </div>
                        </div>
                    </div>

                    {/* Integrated WhatsApp Note */}
                    <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs sm:text-sm flex items-start sm:items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
                        <p className="leading-relaxed">
                            <strong>Seamless Communication:</strong> TQP works alongside existing WhatsApp groups. Task-specific links take students and tutors directly into class registration, session logging, or record verification without extra navigation.
                        </p>
                    </div>

                </div>
            </section>

            {/* =========================================================================
              SERVES BOTH STUDENTS AND TUTORS
             ========================================================================= */}
            <section className="py-16 sm:py-24 bg-white border-y border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

                    <div className="text-center max-w-2xl mx-auto space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">Designed For TQP Participants</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-emerald-950 font-serif">
                            Built for the People Who Make TQP Work
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                        {/* For Students */}
                        <div className="p-8 rounded-2xl bg-[#FBFBF9] border border-amber-900/10 shadow-sm flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-900/10 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                                    <GraduationCap className="w-4 h-4" />
                                    <span>For Students</span>
                                </div>
                                <h3 className="text-2xl font-bold text-emerald-950 font-serif">
                                    Clear Goals & Documented Progress
                                </h3>
                                <ul className="space-y-3 pt-2">
                                    <li className="flex items-start gap-3 text-sm text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                                        <span>Know your exact weekly memorisation and revision targets.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                                        <span>Log session attendance and recitation details in seconds.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                                        <span>Keep revision history structured so older portions are never forgotten.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                                        <span>View your complete verified journey over time.</span>
                                    </li>
                                </ul>
                            </div>

                            <Link
                                href="/register?role=student"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-900 hover:bg-emerald-950 text-white font-semibold text-sm rounded-xl transition"
                            >
                                <span>Student Portal Login</span>
                                <ArrowRight className="w-4 h-4 text-amber-400" />
                            </Link>
                        </div>

                        {/* For Tutors */}
                        <div className="p-8 rounded-2xl bg-[#FBFBF9] border border-amber-900/10 shadow-sm flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 text-amber-900 text-xs font-bold uppercase tracking-wider">
                                    <BookOpen className="w-4 h-4" />
                                    <span>For Tutors & Ustadhs</span>
                                </div>
                                <h3 className="text-2xl font-bold text-emerald-950 font-serif">
                                    Effortless Circle Management
                                </h3>
                                <ul className="space-y-3 pt-2">
                                    <li className="flex items-start gap-3 text-sm text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                                        <span>Organise student groups and maintain fixed timetable schedules.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                                        <span>Launch sessions and verify student entries without manual paperwork.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                                        <span>Track attendance and recitation accuracy across your assigned circle.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-gray-700">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                                        <span>Ensure consistent follow-up for students who need additional assistance.</span>
                                    </li>
                                </ul>
                            </div>

                            <Link
                                href="/register?role=tutor"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-950 hover:bg-black text-white font-semibold text-sm rounded-xl transition"
                            >
                                <span>Tutor Portal Login</span>
                                <ArrowRight className="w-4 h-4 text-amber-400" />
                            </Link>
                        </div>

                    </div>

                </div>
            </section>

            {/* =========================================================================
              ACCOUNTABILITY & PROGRAMME VALUE (MAKING PROGRESS VISIBLE)
             ========================================================================= */}
            <section id="programme-value" className="py-16 sm:py-24 bg-[#FBFBF9] relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl border border-amber-500/20">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                            <div className="lg:col-span-7 space-y-6">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                                    <span>Programme-Wide Oversight</span>
                                </div>

                                <h2 className="text-3xl sm:text-5xl font-bold font-serif text-amber-100 tracking-tight leading-tight">
                                    Making Progress Visible Across TQP
                                </h2>

                                <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                                    Software alone does not create commitment or sincerity—students provide effort, and tutors provide teaching. What this platform provides is <strong>structure and visibility</strong> so the programme can operate efficiently.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-800/80">
                                        <h4 className="font-bold text-amber-300 text-sm mb-1">Clear Session Verification</h4>
                                        <p className="text-xs text-emerald-100/80">Confirms whether classes take place and attendance is maintained.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-800/80">
                                        <h4 className="font-bold text-amber-300 text-sm mb-1">Timely Intervention</h4>
                                        <p className="text-xs text-emerald-100/80">Identifies students falling behind early so coordinators can offer support.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-5 bg-emerald-900/40 p-6 sm:p-8 rounded-2xl border border-emerald-800/80 space-y-4">
                                <h3 className="text-lg font-bold text-amber-200 font-serif border-b border-emerald-800/80 pb-3">
                                    Centralised Programme Insights
                                </h3>
                                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                                    By consolidating attendance, memorisation logs, and revision records, TQP coordinators gain accurate, programme-level data to ensure the long-term success and consistency of every study circle.
                                </p>
                                <div className="pt-2 flex items-center gap-2 text-xs text-amber-300 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                                    <span>Official Platform of IAB • MSSN OAU</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
              FINAL CALL TO ACTION
             ========================================================================= */}
            <section className="py-16 sm:py-20 bg-white border-t border-amber-900/10 text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">Get Started</span>
                    <h2 className="text-3xl sm:text-4xl font-bold font-serif text-emerald-950">
                        Ready to Access the TQP Portal?
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Log into your account or register as a student or tutor to access your classes, schedules, and verified records.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register?role=student"
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-900 hover:bg-emerald-950 text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                        >
                            <GraduationCap className="w-5 h-5 text-amber-400" />
                            <span>Register as Student</span>
                        </Link>
                        <Link
                            href="/register?role=tutor"
                            className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-500 text-emerald-950 font-bold text-sm sm:text-base rounded-xl shadow-md transition flex items-center justify-center gap-2"
                        >
                            <BookOpen className="w-5 h-5" />
                            <span>Register as Tutor</span>
                        </Link>
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-gray-100 hover:bg-gray-200 text-emerald-950 font-semibold text-sm sm:text-base rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Account Login</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* =========================================================================
              FOOTER
             ========================================================================= */}
            <footer className="bg-emerald-950 border-t border-emerald-900/50 text-emerald-200/70 text-xs py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-emerald-900/80 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-900 flex items-center justify-center text-amber-400 border border-amber-500/20">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="font-bold text-sm text-white block">TQP Portal</span>
                                <span className="text-[11px] text-emerald-300/80 block">Islamic Affairs Board (IAB) • MSSN OAU</span>
                            </div>
                        </div>

                        <div className="flex gap-6 text-emerald-300/80">
                            <Link href="/privacy" className="hover:text-amber-300 transition">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-amber-300 transition">Terms of Service</Link>
                            <Link href="/login" className="hover:text-amber-300 transition">Portal Login</Link>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-emerald-400/60 text-[11px]">
                        <p>© {new Date().getFullYear()} TQP (Qur&apos;an Programme), Islamic Affairs Board, MSSN OAU. All rights reserved.</p>
                        <p>Digital Infrastructure for Qur&apos;an Memorisation & Accountability.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}