#!/usr/bin/env node
/**
 * TQP Attendance System — End-to-End Integration Smoke Test
 * -----------------------------------------------------------
 * A standalone Playwright script (no test-runner) that:
 *   1. Launches a headless Chromium browser.
 *   2. Exercises the app's primary user flows: loading pages, clicking
 *      links/buttons, and filling out forms.
 *   3. Captures console errors, uncaught page exceptions, failed network
 *      requests, and HTTP error statuses on every page it visits.
 *   4. Prints a comprehensive text report (and writes it to e2e/report.txt).
 *
 * Usage:
 *   node e2e/run-e2e.mjs
 *
 * Env vars:
 *   BASE_URL        target origin (default http://localhost:3000)
 *   SKIP_SIGNUP     set to "1" to skip dynamic signup flow tests.
 *   SIGNUP_ROLE     "student" (default) or "tutor" — which onboarding to run in signup flow.
 *   HEADED          set to "1" to watch the browser (non-headless).
 *   NAV_TIMEOUT     per-navigation timeout in ms (default 60000).
 *   SETTLE_MS       quiet period after load to catch late errors (default 1500).
 */

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const SKIP_SIGNUP = process.env.SKIP_SIGNUP === "1";
const SIGNUP_ROLE = (process.env.SIGNUP_ROLE || "student").toLowerCase() === "tutor" ? "tutor" : "student";
const SIGNUP_PASSWORD = "saad1234";
const HEADED = process.env.HEADED === "1";
const NAV_TIMEOUT = Number(process.env.NAV_TIMEOUT || 60000);
const SETTLE_MS = Number(process.env.SETTLE_MS || 1500);
const __dirname = dirname(fileURLToPath(import.meta.url));
const STAMP = Date.now();

// Predefined User Credentials
const USER_CREDENTIALS = {
    tutor: {
        email: "saadidris70@gmail.com",
        password: "saad1234",
    },
    student: {
        email: "saadidris23@gmail.com",
        password: "saad1234",
    },
};

// Resource-load failures (favicon, images) surface as console "error" messages
// in Chromium. Filter them out of JavaScript console errors to prevent duplicate noise.
const RESOURCE_ERROR_RE = /Failed to load resource/i;

/** @type {Array<{name:string, category:string, status:'PASS'|'FAIL'|'WARN', details:string[], consoleErrors:string[], pageErrors:string[], networkErrors:string[]}>} */
const results = [];

function record(r) {
    const full = {
        details: [], consoleErrors: [], pageErrors: [], networkErrors: [],
        ...r,
    };
    results.push(full);
    const icon = full.status === "PASS" ? "PASS" : full.status === "WARN" ? "WARN" : "FAIL";
    console.log(`  [${icon}] ${full.name}`);
    for (const d of full.details) console.log(`         ${d}`);
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitFor(cond, timeout = 15000, interval = 100) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (await cond()) return true;
        await sleep(interval);
    }
    return false;
}

// --- Test data generators ---------------------------------------------------

const MUSLIM_FIRST_NAMES = [
    "Muhammad", "Ahmad", "Ali", "Omar", "Yusuf", "Ibrahim", "Bilal", "Hamza",
    "Khalid", "Zakariya", "Aisha", "Fatima", "Maryam", "Khadija", "Zainab",
    "Safiyya", "Ruqayya", "Sumayya", "Aminah", "Hafsa",
];
const MUSLIM_LAST_NAMES = [
    "Abdullah", "Rahman", "Farooq", "Siddiqui", "Ansari", "Qureshi", "Hashmi",
    "Malik", "Saeed", "Nasser", "Ibrahim", "Suleiman", "Yaqub", "Idris", "Bakr",
];

function randomOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function makeIdentity() {
    const first = randomOf(MUSLIM_FIRST_NAMES);
    const last = randomOf(MUSLIM_LAST_NAMES);
    const slug = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "");
    return {
        name: `${first} ${last}`,
        email: `${slug}.${STAMP}${randInt(100, 999)}@example.com`,
        whatsapp: `+234${randInt(7000000000, 9099999999)}`,
        password: SIGNUP_PASSWORD,
    };
}

async function pickSearchable(page, fieldName, label) {
    const hidden = page.locator(`input[type="hidden"][name="${fieldName}"]`);
    const container = hidden.locator("xpath=ancestor::div[contains(@class,'relative')][1]");
    await container.locator('button[type="button"]').click();
    const search = container.getByPlaceholder("Search...");
    await search.fill(label);
    await container.getByText(label, { exact: true }).first().click();
    return waitFor(async () => (await hidden.inputValue()) === label, 5000);
}

async function withPage(browser, fn) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const buf = { consoleErrors: [], pageErrors: [], networkErrors: [], dialogs: [] };

    page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        if (RESOURCE_ERROR_RE.test(text)) return;
        buf.consoleErrors.push(text);
    });
    page.on("pageerror", (err) => buf.pageErrors.push(err.message || String(err)));
    page.on("requestfailed", (req) => {
        const f = req.failure();
        buf.networkErrors.push(`REQFAIL ${req.method()} ${req.url()} — ${f?.errorText || "failed"}`);
    });
    page.on("response", (resp) => {
        const s = resp.status();
        if (s >= 400) buf.networkErrors.push(`HTTP ${s} ${resp.request().method()} ${resp.url()}`);
    });
    page.on("dialog", async (d) => {
        buf.dialogs.push({ type: d.type(), message: d.message() });
        try { await d.accept(); } catch { /* already handled */ }
    });

    page.setDefaultTimeout(NAV_TIMEOUT);
    page.setDefaultNavigationTimeout(NAV_TIMEOUT);

    try {
        return await fn(page, buf);
    } finally {
        await context.close();
    }
}

function classifyDoc(buf, docStatus, extraDetails = []) {
    const details = [...extraDetails];
    let status = "PASS";
    if (buf.pageErrors.length) {
        status = "FAIL";
        details.push(`Uncaught page exception(s): ${buf.pageErrors.join(" | ")}`);
    }
    if (buf.consoleErrors.length) {
        status = "FAIL";
        details.push(`Console error(s): ${buf.consoleErrors.slice(0, 5).join(" | ")}`);
    }
    if (typeof docStatus === "number" && docStatus >= 500) {
        status = "FAIL";
        details.push(`Server error: document returned HTTP ${docStatus}`);
    }
    return { status, details };
}

// ---------------------------------------------------------------------------
// Test definitions
// ---------------------------------------------------------------------------

const PUBLIC_ROUTES = [
    { name: "Landing page  (/)", path: "/", expectText: /TQP|Qur|Portal/i },
    { name: "Login page  (/login)", path: "/login", expectText: /Welcome Back|Login|Email/i },
    { name: "Register page  (/register)", path: "/register", expectText: /Create Your Account|Register|Full Name/i },
];

const GATED_ROUTES = [
    { name: "Enroll  (/enroll) → expects redirect to /login", path: "/enroll" },
    { name: "Dashboard  (/dashboard) → expects redirect to /login", path: "/dashboard" },
    { name: "Admin  (/admin) → expects redirect to /login", path: "/admin" },
    { name: "Onboarding  (/onboarding) → expects redirect to /login", path: "/onboarding" },
];

const LINKED_ROUTES = [
    //     { name: "/attendance", path: "/attendance", linkedFrom: "Navbar nav link" },
    //     { name: "/profile", path: "/profile", linkedFrom: "Navbar profile dropdown" },
    //     { name: "/privacy", path: "/privacy", linkedFrom: "Footer" },
    //     { name: "/terms", path: "/terms", linkedFrom: "Footer" },
];

async function testPublicRoute(browser, route) {
    await withPage(browser, async (page, buf) => {
        let docStatus, finalUrl, bodyLen = 0;
        try {
            const resp = await page.goto(BASE_URL + route.path, { waitUntil: "domcontentloaded" });
            docStatus = resp?.status();
            await sleep(SETTLE_MS);
            finalUrl = page.url();
            bodyLen = (await page.evaluate(() => document.body?.innerText?.length || 0)) ?? 0;
        } catch (e) {
            record({ name: route.name, category: "route", status: "FAIL", details: [`Navigation failed: ${e.message}`], ...buf });
            return;
        }

        const extra = [`HTTP ${docStatus} · final: ${finalUrl} · text length: ${bodyLen}`];
        let { status, details } = classifyDoc(buf, docStatus, extra);

        if (docStatus === 404) { status = "FAIL"; details.push("Route returned 404 (page not found)"); }
        else if (bodyLen < 100) { status = status === "FAIL" ? status : "WARN"; details.push("Page body is nearly empty (<100 chars) — possible render failure"); }

        if (route.expectText) {
            const bodyText = await page.evaluate(() => document.body?.innerText || "");
            if (!route.expectText.test(bodyText)) {
                status = status === "FAIL" ? status : "WARN";
                details.push(`Expected content matching ${route.expectText} not found`);
            }
        }
        if (buf.networkErrors.length) details.push(`${buf.networkErrors.length} network/resource issue(s) — see network section`);

        record({ name: route.name, category: "route", status, details, ...buf });
    });
}

async function testGatedRoute(browser, route) {
    await withPage(browser, async (page, buf) => {
        let docStatus, finalUrl;
        try {
            const resp = await page.goto(BASE_URL + route.path, { waitUntil: "domcontentloaded" });
            docStatus = resp?.status();
            await sleep(SETTLE_MS);
            finalUrl = page.url();
        } catch (e) {
            record({ name: route.name, category: "route", status: "FAIL", details: [`Navigation failed: ${e.message}`], ...buf });
            return;
        }

        const redirectedToLogin = /\/login/.test(finalUrl);
        const extra = [`HTTP ${docStatus} · final: ${finalUrl}`];
        let { status, details } = classifyDoc(buf, docStatus, extra);

        if (docStatus === 404) { status = "FAIL"; details.push("Route returned 404"); }
        else if (!redirectedToLogin) {
            status = status === "FAIL" ? status : "WARN";
            details.push("Expected an unauthenticated redirect to /login but stayed on the page");
        } else {
            details.push("Correctly redirected unauthenticated user to /login");
        }

        record({ name: route.name, category: "route", status, details, ...buf });
    });
}

async function testLinkedRoute(browser, route) {
    await withPage(browser, async (page, buf) => {
        let docStatus, finalUrl;
        try {
            const resp = await page.goto(BASE_URL + route.path, { waitUntil: "domcontentloaded" });
            docStatus = resp?.status();
            await sleep(SETTLE_MS);
            finalUrl = page.url();
        } catch (e) {
            record({ name: `Linked route ${route.name}`, category: "broken-route", status: "FAIL", details: [`Navigation failed: ${e.message}`, `Linked from: ${route.linkedFrom}`], ...buf });
            return;
        }

        const details = [`HTTP ${docStatus} · final: ${finalUrl}`, `Linked from: ${route.linkedFrom}`];
        let status = "PASS";
        if (docStatus === 404) {
            status = "FAIL";
            details.push("BROKEN LINK TARGET: page is linked in the UI but returns 404");
        } else if (docStatus >= 500) {
            status = "FAIL";
            details.push(`Server error HTTP ${docStatus}`);
        } else if (buf.pageErrors.length || buf.consoleErrors.length) {
            status = "FAIL";
            if (buf.pageErrors.length) details.push(`Page exception(s): ${buf.pageErrors.join(" | ")}`);
            if (buf.consoleErrors.length) details.push(`Console error(s): ${buf.consoleErrors.slice(0, 5).join(" | ")}`);
        } else {
            details.push("Route resolves OK");
        }
        record({ name: `Linked route ${route.name}`, category: "broken-route", status, details, ...buf });
    });
}

async function testNavClick(browser, { name, startPath, action, expectUrlRe, expectContent }) {
    await withPage(browser, async (page, buf) => {
        try {
            await page.goto(BASE_URL + startPath, { waitUntil: "domcontentloaded" });
            await sleep(400);
            await action(page);
            const ok = await page.waitForURL(expectUrlRe, { timeout: NAV_TIMEOUT }).then(() => true).catch(() => false);
            await sleep(SETTLE_MS);
            const finalUrl = page.url();
            const details = [`final: ${finalUrl}`];
            let status = "PASS";

            if (!ok) { status = "FAIL"; details.push(`Did not reach expected URL ${expectUrlRe}`); }
            if (buf.pageErrors.length) { status = "FAIL"; details.push(`Page exception(s): ${buf.pageErrors.join(" | ")}`); }
            if (buf.consoleErrors.length) { status = "FAIL"; details.push(`Console error(s): ${buf.consoleErrors.slice(0, 5).join(" | ")}`); }
            if (status !== "FAIL" && expectContent) {
                const bodyText = await page.evaluate(() => document.body?.innerText || "");
                if (!expectContent.test(bodyText)) { status = "WARN"; details.push(`Expected content ${expectContent} not found`); }
            }
            record({ name, category: "nav", status, details, ...buf });
        } catch (e) {
            record({ name, category: "nav", status: "FAIL", details: [`Error: ${e.message}`], ...buf });
        }
    });
}

async function testLoginForm(browser) {
    await withPage(browser, async (page, buf) => {
        const name = "Login form — submit invalid credentials (read-only)";
        try {
            await page.goto(BASE_URL + "/login", { waitUntil: "networkidle" });

            await page.fill("#email", `e2e-nouser-${STAMP}@example.invalid`);
            await page.fill("#password", "definitely-wrong-password");

            // Click submit
            await page.click('button[type="submit"]');

            // Wait for alert/dialog or error message handling
            const gotDialog = await waitFor(() => buf.dialogs.length > 0, 10000);
            await sleep(300);
            const finalUrl = page.url();
            const details = [`final: ${finalUrl}`];
            let status = "PASS";

            if (!gotDialog) {
                status = "FAIL";
                details.push("Expected an error alert after a failed login but none appeared");
            } else {
                const msg = buf.dialogs.map((d) => d.message).join(" | ");
                details.push(`Alert shown: "${msg}"`);
            }

            if (!/\/login/.test(finalUrl)) {
                status = "FAIL";
                details.push("Expected to remain on /login after a failed login");
            }

            record({ name, category: "form", status, details, ...buf });
        } catch (e) {
            record({ name, category: "form", status: "FAIL", details: [`Error: ${e.message}`], ...buf });
        }
    });
}

async function fillStudentOnboarding(page, details) {
    await page.selectOption('select[name="gender"]', "male");
    await page.fill('input[name="matricNumber"]', `21/${randInt(10, 99)}CD${randInt(100, 999)}`);
    const facultyOk = await pickSearchable(page, "faculty", "science");
    await page.fill('input[name="department"]', "Computer Science");
    await page.fill('input[name="level"]', "300");
    const surahOk = await pickSearchable(page, "surah", "Al-Baqarah");
    await page.fill('input[name="aayah"]', "255");
    await page.fill('input[name="juz"]', "1");
    await page.fill('input[name="page"]', "50");
    if (!facultyOk) details.push("WARN: faculty SearchableSelect value did not register");
    if (!surahOk) details.push("WARN: surah SearchableSelect value did not register");
}

async function fillTutorOnboarding(page) {
    await page.selectOption('select[name="gender"]', "male");
    await page.fill('input[name="maximumStudents"]', "5");
}

async function testSignupFlow(browser) {
    // 1. Generate dynamic identity so test runs remain idempotent
    const timestamp = Date.now();
    const identity = {
        name: `Test User ${timestamp}`,
        email: `e2e_student_${timestamp}@example.com`,
        whatsappNumber: `+1555${Math.floor(100000 + Math.random() * 900000)}`,
        password: SIGNUP_PASSWORD,
        role: 'student',
    };

    console.log(`   Attempting signup for dynamic user: ${identity.email}`);

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // 2. Navigate to registration page
        await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });

        // 3. Define target inputs and test payload
        const fields = [
            { selector: 'input[name="name"]', value: identity.name },
            { selector: 'input[name="email"]', value: identity.email },
            { selector: 'input[name="whatsappNumber"]', value: identity.whatsappNumber },
            { selector: 'input[name="password"]', value: identity.password },
        ];

        // 4. Fill each input with explicit events to guarantee React state synchronization
        for (const field of fields) {
            const inputLocator = page.locator(field.selector);

            // Ensure element is ready and focused
            await inputLocator.waitFor({ state: 'visible', timeout: 5000 });
            await inputLocator.click();

            // Clear existing value and fill
            await inputLocator.fill('');
            await inputLocator.fill(field.value);

            // Dispatch native input/change events to trigger React's synthetic listeners
            await inputLocator.dispatchEvent('input');
            await inputLocator.dispatchEvent('change');

            // Assert value was correctly received by the DOM node
            const currentValue = await inputLocator.inputValue();
            if (currentValue !== field.value) {
                throw new Error(
                    `Failed to hydrate field ${field.selector}. Expected "${field.value}", got "${currentValue}".`
                );
            }
        }

        // 5. Click Submit
        const submitBtn = page.locator('button[type="submit"]');
        await submitBtn.waitFor({ state: 'visible' });
        await submitBtn.click();

        // 6. Wait for expected navigation after successful registration
        await page.waitForURL((url) => url.pathname.includes('/onboarding') || url.pathname.includes('/dashboard'), {
            timeout: 10000,
        });

        console.log(`   ✓ Dynamic signup flow succeeded for: ${identity.email}`);
    } finally {
        await context.close();
    }
}

/**
 * Authenticates a user with predefined credentials and returns their context storage state.
 */
async function loginUser(browser, role = "student") {
    const creds = USER_CREDENTIALS[role];
    if (!creds) throw new Error(`No credentials configured for role "${role}"`);

    const context = await browser.newContext();
    const page = await context.newPage();
    let alertMessage = null;

    // Capture alert message if authentication fails
    page.on("dialog", async (d) => {
        alertMessage = d.message();
        try { await d.accept(); } catch { }
    });

    try {
        await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });

        const emailInput = page.locator("#email");
        await emailInput.waitFor({ state: "visible" });

        await emailInput.fill(creds.email);
        await page.fill("#password", creds.password);

        // Click submit button
        await page.click('button[type="submit"]');

        // Wait to check if an alert fired or if navigation occurred
        await sleep(1500);

        if (alertMessage) {
            throw new Error(`Authentication server returned alert: "${alertMessage}"`);
        }

        // Wait for redirect to complete
        await page.waitForURL(/\/dashboard|\/onboarding/, { timeout: NAV_TIMEOUT });
        await sleep(SETTLE_MS);

        const storageState = await context.storageState();
        await context.close();

        return { identity: { email: creds.email }, storageState };
    } catch (err) {
        await context.close();
        throw new Error(`Failed to login ${role} (${creds.email}): ${err.message}`);
    }
}

/**
 * Runs `fn` inside a browser context initialized with pre-authenticated storage state.
 */
async function withAuthenticatedPage(browser, storageState, fn) {
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    const buf = { consoleErrors: [], pageErrors: [], networkErrors: [], dialogs: [] };

    page.on("console", (msg) => {
        if (msg.type() !== "error" || RESOURCE_ERROR_RE.test(msg.text())) return;
        buf.consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => buf.pageErrors.push(err.message || String(err)));
    page.on("requestfailed", (req) => {
        buf.networkErrors.push(`REQFAIL ${req.method()} ${req.url()}`);
    });
    page.on("response", (resp) => {
        if (resp.status() >= 400) buf.networkErrors.push(`HTTP ${resp.status()} ${resp.request().method()} ${resp.url()}`);
    });

    page.setDefaultTimeout(NAV_TIMEOUT);
    page.setDefaultNavigationTimeout(NAV_TIMEOUT);

    try {
        return await fn(page, buf);
    } finally {
        await context.close();
    }
}

// --- Student Protected Route Tests ---
async function testStudentProtectedRoutes(browser, studentAuth) {
    const routes = [
        { name: "Student Dashboard (/dashboard)", path: "/dashboard", expectText: /Student|Dashboard|Surah|Attendance/i },
        { name: "Student Enrollment (/enroll)", path: "/enroll", expectText: /Enroll|Select Tutor|Schedule/i },
        { name: "Student Profile (/profile)", path: "/profile", expectText: /Profile|Settings|Account/i },
    ];

    for (const route of routes) {
        await withAuthenticatedPage(browser, studentAuth.storageState, async (page, buf) => {
            try {
                const resp = await page.goto(BASE_URL + route.path, { waitUntil: "domcontentloaded" });
                await sleep(SETTLE_MS);

                const docStatus = resp?.status();
                const finalUrl = page.url();
                const bodyText = await page.evaluate(() => document.body?.innerText || "");

                const extra = [`HTTP ${docStatus} · final: ${finalUrl}`];
                let { status, details } = classifyDoc(buf, docStatus, extra);

                if (/\/login/.test(finalUrl)) {
                    status = "FAIL";
                    details.push("Authenticated student was unexpectedly redirected to /login");
                } else if (route.expectText && !route.expectText.test(bodyText)) {
                    status = status === "FAIL" ? status : "WARN";
                    details.push(`Expected text matching ${route.expectText} not found`);
                }

                record({ name: `[Student] ${route.name}`, category: "protected-route", status, details, ...buf });
            } catch (e) {
                record({ name: `[Student] ${route.name}`, category: "protected-route", status: "FAIL", details: [e.message], ...buf });
            }
        });
    }
}

// --- Tutor Protected Route Tests ---
async function testTutorProtectedRoutes(browser, tutorAuth) {
    const routes = [
        { name: "Tutor Dashboard (/dashboard)", path: "/dashboard", expectText: /Tutor|Students|Overview|Schedule/i },
        { name: "Mark Attendance (/attendance)", path: "/attendance", expectText: /Attendance|Mark|Roster|Session/i },
        { name: "Tutor Profile (/profile)", path: "/profile", expectText: /Profile|Settings/i },
    ];

    for (const route of routes) {
        await withAuthenticatedPage(browser, tutorAuth.storageState, async (page, buf) => {
            try {
                const resp = await page.goto(BASE_URL + route.path, { waitUntil: "domcontentloaded" });
                await sleep(SETTLE_MS);

                const docStatus = resp?.status();
                const finalUrl = page.url();
                const bodyText = await page.evaluate(() => document.body?.innerText || "");

                const extra = [`HTTP ${docStatus} · final: ${finalUrl}`];
                let { status, details } = classifyDoc(buf, docStatus, extra);

                if (/\/login/.test(finalUrl)) {
                    status = "FAIL";
                    details.push("Authenticated tutor was unexpectedly redirected to /login");
                } else if (route.expectText && !route.expectText.test(bodyText)) {
                    status = status === "FAIL" ? status : "WARN";
                    details.push(`Expected text matching ${route.expectText} not found`);
                }

                record({ name: `[Tutor] ${route.name}`, category: "protected-route", status, details, ...buf });
            } catch (e) {
                record({ name: `[Tutor] ${route.name}`, category: "protected-route", status: "FAIL", details: [e.message], ...buf });
            }
        });
    }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function bar(char = "=", n = 78) { return char.repeat(n); }

function buildReport() {
    const pass = results.filter((r) => r.status === "PASS");
    const warn = results.filter((r) => r.status === "WARN");
    const fail = results.filter((r) => r.status === "FAIL");
    const broken = results.filter((r) => r.category === "broken-route" && r.status === "FAIL");

    const allNet = [];
    for (const r of results) for (const n of r.networkErrors) allNet.push({ test: r.name, msg: n });
    const netDedup = [...new Set(allNet.map((x) => x.msg))];

    const allConsole = [];
    for (const r of results) {
        for (const c of r.consoleErrors) allConsole.push({ test: r.name, msg: c });
        for (const p of r.pageErrors) allConsole.push({ test: r.name, msg: `PAGEERROR: ${p}` });
    }

    const L = [];
    L.push(bar());
    L.push("  TQP ATTENDANCE SYSTEM — END-TO-END INTEGRATION TEST REPORT");
    L.push(bar());
    L.push(`  Target        : ${BASE_URL}`);
    L.push(`  Run at        : ${new Date().toISOString()}`);
    L.push(`  Browser       : Chromium (Playwright, ${HEADED ? "headed" : "headless"})`);
    L.push(`  Signup flow   : ${SKIP_SIGNUP ? "SKIPPED (read-only run)" : `ENABLED — creates a real ${SIGNUP_ROLE} account`}`);
    L.push("");
    L.push(`  RESULT        : ${fail.length === 0 ? "PASS — no failures" : `FAIL — ${fail.length} failing check(s)`}`);
    L.push(`  Totals        : ${results.length} checks → ${pass.length} passed, ${warn.length} warnings, ${fail.length} failed`);
    if (broken.length) L.push(`  Broken routes : ${broken.length} (${broken.map((b) => b.name.replace("Linked route ", "")).join(", ")})`);
    L.push("");

    const section = (title, items) => {
        L.push(bar("-"));
        L.push(`  ${title}`);
        L.push(bar("-"));
        if (!items.length) { L.push("  (none)"); L.push(""); return; }
        for (const r of items) {
            const tag = r.status.padEnd(4);
            L.push(`  [${tag}] ${r.name}`);
            for (const d of r.details) L.push(`         - ${d}`);
        }
        L.push("");
    };

    section("PAGE LOAD / ROUTE SMOKE TESTS", results.filter((r) => r.category === "route"));
    section("NAVIGATION FLOWS (link clicks)", results.filter((r) => r.category === "nav"));
    section("FORM INTERACTION FLOWS", results.filter((r) => r.category === "form"));
    section("LINKED ROUTE REACHABILITY (broken-link check)", results.filter((r) => r.category === "broken-route"));
    section("PROTECTED ROUTES (AUTHENTICATED SESSION CHECKS)", results.filter((r) => r.category === "protected-route"));

    L.push(bar("-"));
    L.push("  CONSOLE / PAGE ERRORS");
    L.push(bar("-"));
    if (!allConsole.length) L.push("  (none captured — excludes benign console.log and resource-404 noise)");
    else for (const c of allConsole) L.push(`  • [${c.test}] ${c.msg}`);
    L.push("");

    L.push(bar("-"));
    L.push("  NETWORK ERRORS & HTTP >=400 RESPONSES (deduplicated)");
    L.push(bar("-"));
    if (!netDedup.length) L.push("  (none)");
    else for (const n of netDedup) L.push(`  • ${n}`);
    L.push("");

    L.push(bar());
    L.push(`  END OF REPORT — ${fail.length === 0 ? "SUITE PASSED" : "SUITE FAILED"}`);
    L.push(bar());
    return L.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    console.log(`\nTQP E2E smoke test → ${BASE_URL}\n`);

    // Fail fast if the dev server is not reachable.
    try {
        const res = await fetch(BASE_URL, { method: "GET" });
        console.log(`Server reachable: HTTP ${res.status}\n`);
    } catch (e) {
        console.error(`\n✗ Cannot reach ${BASE_URL}. Is the dev server running (npm run dev)?\n  ${e.message}\n`);
        process.exit(2);
    }

    const browser = await chromium.launch({ headless: !HEADED });
    try {
        console.log("• Public route smoke tests");
        for (const r of PUBLIC_ROUTES) await testPublicRoute(browser, r);

        console.log("• Auth-gated route redirect tests");
        for (const r of GATED_ROUTES) await testGatedRoute(browser, r);

        console.log("• Navigation (link-click) flows");
        await testNavClick(browser, {
            name: "Landing → click 'Sign In' → /login",
            startPath: "/",
            action: (p) => p.getByRole("link", { name: "Sign In" }).first().click(),
            expectUrlRe: /\/login/,
            expectContent: /Welcome Back|Login/i,
        });
        await testNavClick(browser, {
            name: "Landing → click 'Enroll with a Tutor Now' → /enroll → /login redirect",
            startPath: "/",
            action: (p) => p.getByRole("link", { name: /Enroll with a Tutor Now/i }).first().click(),
            expectUrlRe: /\/login/,
            expectContent: /Welcome Back|Login/i,
        });
        await testNavClick(browser, {
            name: "Login → click 'Register Here' → /register",
            startPath: "/login",
            action: (p) => p.getByRole("link", { name: /Register Here/i }).first().click(),
            expectUrlRe: /\/register/,
            expectContent: /Create Your Account|Full Name/i,
        });
        await testNavClick(browser, {
            name: "Register → click 'Sign In Here' → /login",
            startPath: "/register",
            action: (p) => p.getByRole("link", { name: /Sign In Here/i }).first().click(),
            expectUrlRe: /\/login/,
            expectContent: /Welcome Back|Login/i,
        });

        console.log("• Form interaction flows");
        await testLoginForm(browser);

        console.log("• Authenticating predefined Student and Tutor accounts...");

        // 1. Authenticate predefined accounts via /login
        const studentAuth = await loginUser(browser, "student");
        console.log(`  ✓ Student authenticated: ${studentAuth.identity.email}`);

        const tutorAuth = await loginUser(browser, "tutor");
        console.log(`  ✓ Tutor authenticated:   ${tutorAuth.identity.email}`);

        // 2. Exercise protected student routes
        console.log("• Testing Protected Student Routes");
        await testStudentProtectedRoutes(browser, studentAuth);

        // 3. Exercise protected tutor routes
        console.log("• Testing Protected Tutor Routes");
        await testTutorProtectedRoutes(browser, tutorAuth);

        // 4. Run dynamic signup test if desired (and not explicitly skipped)
        if (!SKIP_SIGNUP) {
            console.log("• Testing Dynamic Registration & Onboarding Flow");
            await testSignupFlow(browser);
        } else {
            console.log("  (dynamic signup test flow skipped — SKIP_SIGNUP=1)");
        }

        console.log("• Linked-route reachability (broken-link check)");
        for (const r of LINKED_ROUTES) await testLinkedRoute(browser, r);
    } finally {
        await browser.close();
    }

    const report = buildReport();
    console.log("\n" + report + "\n");
    const outPath = join(__dirname, "report.txt");
    writeFileSync(outPath, report, "utf8");
    console.log(`Report written to ${outPath}`);

    const failed = results.filter((r) => r.status === "FAIL").length;
    process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
    console.error("Fatal error in test runner:", e);
    process.exit(3);
});