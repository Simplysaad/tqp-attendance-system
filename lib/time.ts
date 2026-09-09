// Converts "10:30" -> 630 minutes
export function timeStringToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
}

// Converts 630 minutes -> "10:30"
export function minutesToTimeString(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
}

export function getNextOccurrenceDate(dayOfWeek: string, startTimeInMinutes: number): Date {
    const DAYS_MAP: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
    };

    const now = new Date();
    const targetDayIndex = DAYS_MAP[dayOfWeek.toLowerCase().trim()];

    // Derive hours and minutes from total minutes from midnight
    const hours = Math.floor(startTimeInMinutes / 60);
    const minutes = startTimeInMinutes % 60;

    let daysAhead = targetDayIndex - now.getDay();

    // Construct the target date for the occurrence on the target day of this week
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysAhead);
    targetDate.setHours(hours, minutes, 0, 0);

    // If the target day/time is earlier in the current week, or if it's today and the time has already passed, push to next week
    if (daysAhead < 0 || (daysAhead === 0 && targetDate <= now)) {
        daysAhead += 7;
        targetDate.setDate(now.getDate() + daysAhead);
    }

    return targetDate;
}