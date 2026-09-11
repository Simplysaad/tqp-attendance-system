

```markdown
# 📈 TQP Platform: Progress Report & MVP Roadmap

## 📌 Executive Overview
The **TQP Platform** is a digital management system designed for the TQP (Tahfiz/Qur'an memorisation) programme of MSSN OAU[cite: 1]. Its core objective is to replace irregular attendance and informal scheduling with a structured, accountable ecosystem driven by tutor assignments, progress tracking, and proactive intervention[cite: 1].

---

## 🛠️ Feature Audit: Planned vs. Implemented

| Plan Component[cite: 1] | Status | Implemented Functionality | Pending Deliverables |
| :--- | :--- | :--- | :--- |
| **1. Student Onboarding** | 🟢 Done | Next.js onboarding form, academic level, faculty/dept, & current Qur'an baseline (Surah, Aayah, Page)[cite: 1]. | Semester target/goal setting (e.g. target Juz count for semester end)[cite: 1]. |
| **2. Schedule & Assignment** | 🟢 Done | Mongoose query methods & `getNextOccurrenceDate` proximity algorithm for active class mapping[cite: 1]. | Dynamic schedule status updates based on real-time class boundaries. |
| **3. Tutor Management** | 🟢 Done | Tutor dashboard, student schedule retrieval, and session logging workflows. | Custom tutor availability rule configurations (gender preference, capacity limits). |
| **4. Session Tracking** | 🟢 Done | Attendance recording (`present`/`absent`), memorization tracking, and past session history feeds. | Detailed performance notes and revision rating system. |
| **5. Student Progress Dashboard** | 🟢 Done | Progress metrics, attendance rate calculations, live class banners, and status badges. | Semester target completion percentage visualizer. |
| **6. Coordinator System** | 🔴 Pending | — | Admin analytics dashboard, single/bulk student assignment engine, and student risk classification views. |
| **7. Google Meet & Reminders** | 🟡 Partial | Dynamic pseudo-links and Google Meet link fallback resolution on dashboards. | Pre/post-class automated notifications via Email or WhatsApp. |

---

## 🎯 Current MVP Completion Status


```

[==========================..........] 65% MVP Completed

```

### ✅ Phase 1: Onboarding & Foundations (Completed)
- [x] Student registration & academic profile setup (`StudentOnboardingForm`)[cite: 1].
- [x] Initial Qur'an memorization entry (Surah, Aayah, Page, Juz)[cite: 1].
- [x] Custom `SearchableSelect` components for faculties and Surah lists[cite: 1].
- [x] Data transformations for server actions (string to number conversions).

### ✅ Phase 2: Schedule Engine & Student Dashboard (Completed)
- [x] Query logic to retrieve nearest upcoming schedules (`getNearestSchedule`)[cite: 1].
- [x] Date/time calculation helper (`getNextOccurrenceDate`) to map weekly recurring slots to current dates.
- [x] Render nearest upcoming session on the Student Dashboard (`/dashboard`).
- [x] Dynamic `JoinClassButton` rendering with active/inactive link state detection.

### ✅ Phase 3: Tutor Workflows & Session Logging (Completed)
- [x] Build Tutor Dashboard & schedule toggle mechanics (`ActivateNearestScheduleButton`).
- [x] Build Session Logger for tutors and recent session history feed:
  - Attendance Status (`present` / `absent`)[cite: 1].
  - New Memorization completed (start/end Surah, Juz, Page)[cite: 1].
  - Attendance rate calculations across sessions.

### 🔴 Phase 4: Coordinator & Admin System (Started)
- [x] Admin Command Center overview (`/admin`) with platform KPIs (Total Students, Total Tutors, Live Classes)[cite: 1].
- [ ] Single & Bulk Student Assignment actions (`assignSingleStudent`, `assignBulkStudents`).
- [ ] Unassigned student queue management.
- [ ] Automated status detection engine (🟢 On Track, 🟡 At Risk, 🔴 Inactive based on attendance thresholds)[cite: 1].

### 🔴 Phase 5: Notifications & Polish (Pending)
- [ ] Pre-class and post-session automated reminders - using nodemailer.
- [ ] Toast notifications and loading skeleton screens across all flows.
- [ ] End-to-end user testing (Student onboarding ➔ Tutor logging ➔ Admin distribution).

---

## 🚀 Priority Action Plan (Next Immediate Steps)

1. **Admin Overview Page (`/admin`):** Implement the minimal admin dashboard view displaying aggregated platform KPIs (Active Students, Total Tutors, Active Live Classes, At-Risk Count).
2. **Assignment Engine UI:** Build the UI interface for the `assignSingleStudent` and `assignBulkStudents` server actions to pair unassigned students with tutors.
3. **Automated At-Risk Engine:** Implement a query background task to auto-flag students as `at risk` when attendance rates drop or sessions are missed consecutively.

```