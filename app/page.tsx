import React from "react";
import Link from "next/link";
import {
    BookOpen,
    CalendarCheck,
    CheckCircle2,
    Clock,
    ShieldCheck,
    Sparkles,
    Users,
    Video,
    ArrowRight,
    GraduationCap,
    ChevronRight,
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#FBFBF9] text-gray-900 selection:bg-amber-100 selection:text-amber-900 font-sans antialiased">
            {/* =========================================================================
          HERO SECTION: "No More Hurdles in Your Qur'an Journey"
         ========================================================================= */}
            <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-36">
                {/* Subtle Decorative Background Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-emerald-900/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-10 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                        {/* Left Column: Reassuring Headlines */}
                        <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-8">

                            {/* Trust Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-600/20 text-amber-900 text-xs sm:text-sm font-medium">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                <span>Structured Accountability • Guaranteed Retention</span>
                            </div>

                            {/* Main Headline */}
                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-emerald-950 leading-[1.15] font-serif">
                                Your Qur&apos;an Goals Are No Longer Out of Reach.
                            </h1>

                            {/* Empathetic Subtitle */}
                            <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                                Busy schedules, inconsistent classes, and lack of structured follow-up stop most students from completing their memorisation. We solved all three—connecting you to dedicated <span className="font-semibold text-emerald-950">Ustadhs</span> through an automated, hassle-free portal.
                            </p>

                            {/* Hero CTA Group */}
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                                <Link
                                    href="/enroll"
                                    className="w-full sm:w-auto px-8 py-4 bg-emerald-900 hover:bg-emerald-950 text-white font-semibold text-base rounded-xl shadow-xl shadow-emerald-950/20 border border-amber-500/30 flex items-center justify-center gap-3 transition-all hover:gap-4"
                                >
                                    <span>Enroll with a Tutor Now</span>
                                    <ArrowRight className="w-5 h-5 text-amber-400" />
                                </Link>
                                <Link
                                    href="#how-it-works"
                                    className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-gray-50 text-emerald-950 font-semibold text-base rounded-xl border border-gray-200 shadow-sm flex items-center justify-center transition"
                                >
                                    How It Works
                                </Link>
                            </div>

                            {/* Mini Social Proof Bar */}
                            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 border-t border-gray-200/60 text-xs sm:text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                                    <span>Max 5 Students per Tutor</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                    <span>Verified Google Meet Links</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Hero Visual Artwork */}
                        <div className="lg:col-span-5 relative">
                            <div className="relative mx-auto max-w-md lg:max-w-none">
                                {/* Gold Backdrop Trim Card */}
                                <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-600/30 via-emerald-800/20 to-emerald-950/40 rounded-3xl blur-sm" />

                                {/* Main Card Container */}
                                <div className="relative bg-white border border-amber-900/10 rounded-2xl p-3 shadow-2xl overflow-hidden">
                                    {/* 
                      GEMINI IMAGE PROMPT:
                      "A cinematic, high-resolution photograph of an open classical Quran with elegant Arabic calligraphy on illuminated parchment pages. Soft golden sunlight rays beaming onto the pages. Deep emerald background shadows, peaceful and majestic atmosphere."
                  */}
                                    <div className="relative h-72 sm:h-96 w-full rounded-xl bg-emerald-950 overflow-hidden flex items-center justify-center group">
                                        <img
                                            src="/images/hero-quran-majestic.jpg"
                                            alt="Majestic Illuminated Quran"
                                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent" />

                                        {/* Live Badge Overlay */}
                                        <div className="absolute bottom-4 left-4 right-4 bg-emerald-950/90 backdrop-blur-md p-4 rounded-xl border border-amber-500/30 text-white flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                                                <div>
                                                    <p className="text-xs font-semibold text-amber-300">Live Structured Sessions</p>
                                                    <p className="text-[11px] text-gray-300">Instant One-Click Attendance Logging</p>
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
          PAIN POINTS vs OUR SOLUTION ("DON'T WORRY")
         ========================================================================= */}
            <section className="py-16 sm:py-24 bg-white border-y border-amber-900/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <h2 className="text-2xl sm:text-4xl font-bold text-emerald-950 font-serif tracking-tight">
                            Why Traditional Virtual Classes Fail—And How We Fixed It
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">
                            We eliminated every administrative barrier so you and your tutor can focus strictly on pure recitation and memorisation.
                        </p>
                    </div>

                    <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">

                        {/* Feature 1 */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-[#FBFBF9] border border-amber-900/10 hover:border-emerald-800/30 transition-all hover:shadow-lg group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-900/10 text-emerald-900 flex items-center justify-center mb-6 group-hover:bg-emerald-900 group-hover:text-amber-400 transition-colors">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-950 mb-2">Strict Capacity Limits</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Tutors take a maximum of 5 students. You get genuine individual attention, dedicated recitation time, and personal feedback every single class.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-[#FBFBF9] border border-amber-900/10 hover:border-emerald-800/30 transition-all hover:shadow-lg group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-900/10 text-emerald-900 flex items-center justify-center mb-6 group-hover:bg-emerald-900 group-hover:text-amber-400 transition-colors">
                                <Video className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-950 mb-2">One-Click Class Entry</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                No hunting for lost WhatsApp links. When your tutor activates the class, a live button appears on your dashboard taking you straight to Google Meet.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-6 sm:p-8 rounded-2xl bg-[#FBFBF9] border border-amber-900/10 hover:border-emerald-800/30 transition-all hover:shadow-lg group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-900/10 text-emerald-900 flex items-center justify-center mb-6 group-hover:bg-emerald-900 group-hover:text-amber-400 transition-colors">
                                <CalendarCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-950 mb-2">Inherited Schedules</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                When you enroll with an Ustadh, you automatically inherit their complete weekly timetable, keeping your attendance accountable and predictable.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* =========================================================================
          THE DUAL FLOW: HOW IT WORKS (TUTOR vs STUDENT)
         ========================================================================= */}
            <section id="how-it-works" className="py-16 sm:py-28 bg-[#FBFBF9] relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">

                    <div className="text-center max-w-2xl mx-auto space-y-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Simple & Transparent</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-emerald-950 font-serif">How the Portal Operates</h2>
                    </div>

                    {/* STUDENT FLOW */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                        <div className="lg:col-span-6 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-900/10 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                                <GraduationCap className="w-4 h-4" />
                                <span>For Students</span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-bold text-emerald-950 font-serif">
                                Three Clicks to Begin Your Retention Journey
                            </h3>

                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 rounded-xl bg-white border border-gray-200/80 shadow-sm">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-800 font-bold flex items-center justify-center text-sm">1</span>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Explore Tutors & Schedules</h4>
                                        <p className="text-xs text-gray-600 mt-0.5">Browse available Ustadhs, read their bios, and examine their fixed weekly class times.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 rounded-xl bg-white border border-gray-200/80 shadow-sm">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-800 font-bold flex items-center justify-center text-sm">2</span>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Commit & Inherit Timetable</h4>
                                        <p className="text-xs text-gray-600 mt-0.5">Click &quot;Enroll&quot; to join an Ustadh&apos;s circle (up to 5 students maximum) and automatically inherit their routine.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 rounded-xl bg-white border border-gray-200/80 shadow-sm">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-800 font-bold flex items-center justify-center text-sm">3</span>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Join Live Sessions</h4>
                                        <p className="text-xs text-gray-600 mt-0.5">Log into your dashboard at class time. Click the active Google Meet link to log attendance instantly.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Student Image Visual */}
                        <div className="lg:col-span-6">
                            {/* 
                  GEMINI IMAGE PROMPT:
                  "A young Muslim university student sitting in a bright modern quiet library space with headphones on, attentively looking at a laptop screen displaying a digital Quran Mushaf page. Natural soft lighting, focused and peaceful demeanor, high detail."
              */}
                            <div className="relative rounded-2xl overflow-hidden border border-amber-900/10 shadow-2xl bg-emerald-950 h-72 sm:h-96">
                                <img
                                    src="/images/student-memorizing.jpg"
                                    alt="Student Memorizing Quran"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                            </div>
                        </div>

                    </div>

                    {/* TUTOR FLOW */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-8 border-t border-gray-200/60">

                        <div className="lg:col-span-6 order-2 lg:order-1">
                            {/* 
                  GEMINI IMAGE PROMPT:
                  "A warm and dignified photograph of a male Quran tutor with a subtle beard wearing a clean thobe, sitting in a dimly lit study with Islamic books in background, smiling calmly at a digital tablet. Soft green ambient lighting, professional portrait."
              */}
                            <div className="relative rounded-2xl overflow-hidden border border-amber-900/10 shadow-2xl bg-emerald-950 h-72 sm:h-96">
                                <img
                                    src="/images/tutor-teaching.jpg"
                                    alt="Quran Tutor Teaching"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                            </div>
                        </div>

                        <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 text-amber-900 text-xs font-bold uppercase tracking-wider">
                                <BookOpen className="w-4 h-4" />
                                <span>For Tutors & Ustadhs</span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-bold text-emerald-950 font-serif">
                                Effortless Class Management & Automated Tracking
                            </h3>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Set up your weekly availability hours once—the platform routes enrolled students directly to your schedule.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Activate your nearest class link with a single tap from your dashboard to notify students.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Automatic attendance logging and student progress tracking without tedious administrative bookkeeping.</span>
                                </li>
                            </ul>
                        </div>

                    </div>

                </div>
            </section>

            {/* =========================================================================
          MAJESTIC CTA BANNER
         ========================================================================= */}
            <section className="py-16 sm:py-24 bg-emerald-950 relative overflow-hidden text-white">
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Begin Today</span>
                    <h2 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight text-amber-100">
                        Take the First Step Towards Consistent Recitation
                    </h2>
                    <p className="text-sm sm:text-lg text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
                        Join a dedicated circle under the guidance of an Ustadh. Spaces are capped at 5 students per class to ensure excellence.
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/enroll"
                            className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-500 text-emerald-950 font-bold text-base rounded-xl shadow-xl transition-all hover:scale-105"
                        >
                            Browse Available Tutors
                        </Link>
                    </div>
                </div>
            </section>

            {/* =========================================================================
          FOOTER
         ========================================================================= */}
            <footer className="bg-emerald-950 border-t border-emerald-900/50 text-emerald-200/60 text-xs py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>© {new Date().getFullYear()} TQP Attendance & Retention Portal. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-amber-300 transition">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-amber-300 transition">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}