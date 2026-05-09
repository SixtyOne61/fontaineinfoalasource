const WEEKDAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const WEEKDAY_LABELS = {
    fr: {
        sunday: "dimanche",
        monday: "lundi",
        tuesday: "mardi",
        wednesday: "mercredi",
        thursday: "jeudi",
        friday: "vendredi",
        saturday: "samedi",
    },
    en: {
        sunday: "Sunday",
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
    },
};

const RECURRENCE_DATE_LOCALE = {
    fr: "fr-FR",
    en: "en-GB",
};

function normalizeDate(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

export function parseLocalDate(value) {
    if (typeof value !== "string" || !value) {
        return null;
    }

    const [year, month, day] = value.split("-").map((part) => Number(part));

    if (!year || !month || !day) {
        return null;
    }

    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : normalizeDate(date);
}

export function formatDateKey(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addDays(date, count) {
    const next = new Date(date);
    next.setDate(next.getDate() + count);
    return normalizeDate(next);
}

function addMonths(date, count, anchorDay) {
    const next = new Date(date);
    next.setDate(1);
    next.setMonth(next.getMonth() + count);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(anchorDay, lastDay));
    return normalizeDate(next);
}

function getDayOffset(start, end) {
    return Math.max(0, Math.round((normalizeDate(end) - normalizeDate(start)) / 86400000));
}

function getWeekStart(date) {
    const start = normalizeDate(date);
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
    return start;
}

function getWeekDifference(from, to) {
    return Math.floor((getWeekStart(to) - getWeekStart(from)) / (7 * 86400000));
}

function getWeekdayKeys(recurrence, startDate) {
    if (recurrence?.frequency === "weekdays") {
        return ["monday", "tuesday", "wednesday", "thursday", "friday"];
    }

    if (Array.isArray(recurrence?.weekdays) && recurrence.weekdays.length > 0) {
        return recurrence.weekdays;
    }

    return [WEEKDAY_KEYS[startDate.getDay()]];
}

function joinLabels(values, lang) {
    if (values.length <= 1) {
        return values[0] || "";
    }

    if (values.length === 2) {
        return lang === "en" ? `${values[0]} and ${values[1]}` : `${values[0]} et ${values[1]}`;
    }

    const lastValue = values[values.length - 1];
    const leadingValues = values.slice(0, -1).join(", ");
    return lang === "en" ? `${leadingValues}, and ${lastValue}` : `${leadingValues} et ${lastValue}`;
}

function formatRecurrenceUntil(value, lang) {
    const date = parseLocalDate(value);
    if (!date) {
        return "";
    }

    return new Intl.DateTimeFormat(RECURRENCE_DATE_LOCALE[lang] || RECURRENCE_DATE_LOCALE.fr, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function getRecurrenceSuffix(recurrence, lang) {
    const until = formatRecurrenceUntil(recurrence?.until, lang);
    return until ? (lang === "en" ? ` until ${until}` : ` jusqu'au ${until}`) : "";
}

function matchesDailyRecurrence(current, startDate, interval) {
    const diffDays = Math.floor((current - startDate) / 86400000);
    return diffDays >= 0 && diffDays % interval === 0;
}

function matchesWeeklyRecurrence(current, startDate, recurrence, interval) {
    const weekdayKey = WEEKDAY_KEYS[current.getDay()];
    const weekdays = getWeekdayKeys(recurrence, startDate);

    if (!weekdays.includes(weekdayKey) || current < startDate) {
        return false;
    }

    return getWeekDifference(startDate, current) % interval === 0;
}

function matchesMonthlyRecurrence(current, startDate, interval) {
    if (current < startDate) {
        return false;
    }

    const monthsDiff =
        (current.getFullYear() - startDate.getFullYear()) * 12 +
        (current.getMonth() - startDate.getMonth());

    if (monthsDiff < 0 || monthsDiff % interval !== 0) {
        return false;
    }

    const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    return current.getDate() === Math.min(startDate.getDate(), lastDay);
}

function matchesRecurrence(current, startDate, recurrence) {
    const interval = recurrence?.interval || 1;

    switch (recurrence?.frequency) {
        case "daily":
            return matchesDailyRecurrence(current, startDate, interval);
        case "weekly":
        case "weekdays":
            return matchesWeeklyRecurrence(current, startDate, recurrence, interval);
        case "monthly":
            return matchesMonthlyRecurrence(current, startDate, interval);
        default:
            return false;
    }
}

function buildOccurrence(baseEvent, occurrenceStart, durationDays, occurrenceIndex) {
    const startDate = formatDateKey(occurrenceStart);
    const endDate = formatDateKey(addDays(occurrenceStart, durationDays));

    return {
        ...baseEvent,
        id: `${baseEvent.id}-${startDate}`,
        baseEventId: baseEvent.id,
        occurrenceIndex,
        startDate,
        endDate,
        isRecurringInstance: true,
    };
}

function getExpansionEndDate(startDate, recurrence) {
    const explicitEnd = parseLocalDate(recurrence?.until);
    if (explicitEnd) {
        return explicitEnd;
    }

    return addMonths(startDate, 12, startDate.getDate());
}

function expandRecurringEvent(event) {
    const startDate = parseLocalDate(event.startDate);
    const endDate = parseLocalDate(event.endDate || event.startDate);
    const recurrence = event.recurrence;

    if (!startDate || !endDate || !recurrence?.frequency) {
        return [event];
    }

    const expansionEndDate = getExpansionEndDate(startDate, recurrence);
    const durationDays = getDayOffset(startDate, endDate);
    const occurrences = [];
    let cursor = new Date(startDate);
    let occurrenceIndex = 0;

    while (cursor <= expansionEndDate) {
        if (matchesRecurrence(cursor, startDate, recurrence)) {
            occurrences.push(buildOccurrence(event, cursor, durationDays, occurrenceIndex));
            occurrenceIndex += 1;
        }

        cursor = addDays(cursor, 1);
    }

    return occurrences.length > 0 ? occurrences : [event];
}

export function expandRecurringEvents(events) {
    return events.flatMap(expandRecurringEvent);
}

export function getEventStartDate(event) {
    return event?.startDate || "";
}

export function getEventEndDate(event) {
    return event?.endDate || event?.startDate || "";
}

export function compareEventsByStartDate(a, b) {
    const aDate = parseLocalDate(getEventStartDate(a));
    const bDate = parseLocalDate(getEventStartDate(b));

    if (!aDate || !bDate) {
        return 0;
    }

    return aDate - bDate;
}

export function getDatesInRange(startValue, endValue) {
    const startDate = parseLocalDate(startValue);
    const endDate = parseLocalDate(endValue || startValue);

    if (!startDate || !endDate) {
        return [];
    }

    const dates = [];
    let current = new Date(startDate);

    while (current <= endDate) {
        dates.push(formatDateKey(current));
        current = addDays(current, 1);
    }

    return dates;
}

export function getRecurrenceLabel(event, lang = "fr") {
    const recurrence = event?.recurrence;
    if (!recurrence?.frequency) {
        return "";
    }

    const locale = lang === "en" ? "en" : "fr";
    const interval = recurrence.interval || 1;
    const weekdays = getWeekdayKeys(recurrence, parseLocalDate(getEventStartDate(event)) || new Date()).map(
        (weekday) => WEEKDAY_LABELS[locale][weekday]
    );
    const weekdaysLabel = joinLabels(weekdays, locale);
    const suffix = getRecurrenceSuffix(recurrence, locale);

    if (locale === "en") {
        if (recurrence.frequency === "daily") {
            return interval === 1 ? `Every day${suffix}` : `Every ${interval} days${suffix}`;
        }

        if (recurrence.frequency === "weekdays") {
            return interval === 1 ? `Every weekday${suffix}` : `Every ${interval} weeks on weekdays${suffix}`;
        }

        if (recurrence.frequency === "monthly") {
            return interval === 1 ? `Every month${suffix}` : `Every ${interval} months${suffix}`;
        }

        if (interval === 1) {
            return weekdays.length === 1
                ? `Every ${weekdaysLabel}${suffix}`
                : `Every week on ${weekdaysLabel}${suffix}`;
        }

        return `Every ${interval} weeks on ${weekdaysLabel}${suffix}`;
    }

    if (recurrence.frequency === "daily") {
        return interval === 1 ? `Tous les jours${suffix}` : `Tous les ${interval} jours${suffix}`;
    }

    if (recurrence.frequency === "weekdays") {
        return interval === 1 ? `Du lundi au vendredi${suffix}` : `Toutes les ${interval} semaines, du lundi au vendredi${suffix}`;
    }

    if (recurrence.frequency === "monthly") {
        return interval === 1 ? `Chaque mois${suffix}` : `Tous les ${interval} mois${suffix}`;
    }

    if (interval === 1) {
        return weekdays.length === 1
            ? `Tous les ${weekdaysLabel}${suffix}`
            : `Chaque semaine le ${weekdaysLabel}${suffix}`;
    }

    return `Toutes les ${interval} semaines, le ${weekdaysLabel}${suffix}`;
}
