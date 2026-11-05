const DEFAULT_TZ = "Europe/Madrid";
const DEFAULT_LOCALE = "es-ES";

/** "Wednesday, November 4, 2026, 18:30" */
export function formatDateTime(
    date: Date = new Date(),
    timeZone: string = DEFAULT_TZ,
    locale: string = DEFAULT_LOCALE,
): string {
    return new Intl.DateTimeFormat(locale, {
        timeZone,
        dateStyle: "full",
        timeStyle: "short",
    }).format(date);
}

/** "18:30" */
export function formatTime(
    date: Date = new Date(),
    timeZone: string = DEFAULT_TZ,
    locale: string = DEFAULT_LOCALE,
): string {
    return new Intl.DateTimeFormat(locale, {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).format(date);
}

function compact(
    date: Date,
    timeZone: string,
    locale: string,
    withSeconds: boolean,
): string {
    return new Intl.DateTimeFormat(locale, {
        timeZone,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        ...(withSeconds && { second: "2-digit" }),
        hourCycle: "h23",
    }).format(date);
}

/** "05/11/2026, 18:30" */
export function formatCompact(
    date: Date = new Date(),
    timeZone: string = DEFAULT_TZ,
    locale: string = DEFAULT_LOCALE,
): string {
    return compact(date, timeZone, locale, false);
}

/** "05/11/2026, 18:30:12" */
export function formatCompactSeconds(
    date: Date = new Date(),
    timeZone: string = DEFAULT_TZ,
    locale: string = DEFAULT_LOCALE,
): string {
    return compact(date, timeZone, locale, true);
}

/** Native Discord timestamp: each user sees it in their own time zone. */
export function discordTimestamp(
    date: Date = new Date(),
    style: "t" | "T" | "d" | "D" | "f" | "F" | "R" = "F",
): string {
    return `<t:${Math.floor(date.getTime() / 1000)}:${style}>`;
}