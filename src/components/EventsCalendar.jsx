import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../useLocale";

function formatDateKey(date) {
    return date.toISOString().split("T")[0];
}

function isSameMonth(date, currentDate) {
    return (
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
    );
}

function getCalendarDays(currentMonth) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = (firstDayOfMonth.getDay() + 6) % 7;
    const calendarStart = new Date(year, month, 1 - startDay);

    return Array.from({ length: 42 }, (_, index) => {
        const day = new Date(calendarStart);
        day.setDate(calendarStart.getDate() + index);
        return day;
    });
}

function getDatesInRange(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);
    const last = new Date(endDate);

    while (current <= last) {
        dates.push(formatDateKey(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

export default function EventsCalendar({ events }) {
    const { lang, locale } = useLocale();
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    const eventsByDate = useMemo(() => {
        const map = {};

        events.forEach((event) => {
            const start = event.startDate || event.date;
            const end = event.endDate || event.startDate || event.date;

            if (!start || !end) return;

            getDatesInRange(start, end).forEach((dateKey) => {
                if (!map[dateKey]) {
                    map[dateKey] = [];
                }

                map[dateKey].push(event);
            });
        });

        return map;
    }, [events]);

    const days = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
    const weekDays = lang === "en" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const monthLabel = currentMonth.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
    });

    return (
        <section className="rounded-3xl border border-[#d7e8e1] bg-white p-5 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold capitalize text-[#163c35] sm:text-2xl">
                    {monthLabel}
                </h2>

                <div className="grid grid-cols-2 gap-3 sm:flex">
                    <button
                        type="button"
                        onClick={() =>
                            setCurrentMonth(
                                new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                            )
                        }
                        className="rounded-xl border border-[#a7cfc1] bg-white px-4 py-2.5 text-sm text-[#1f5e54] transition hover:bg-[#d7e8e1] sm:text-base"
                    >
                        {lang === "en" ? "← Previous" : "← Précédent"}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setCurrentMonth(
                                new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                            )
                        }
                        className="rounded-xl border border-[#a7cfc1] bg-white px-4 py-2.5 text-sm text-[#1f5e54] transition hover:bg-[#d7e8e1] sm:text-base"
                    >
                        {lang === "en" ? "Next →" : "Suivant →"}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                    <div className="mb-2 grid grid-cols-7 gap-2">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="py-2 text-center text-sm font-semibold text-[#5b7d76]"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {days.map((day) => {
                            const key = formatDateKey(day);
                            const dayEvents = eventsByDate[key] || [];
                            const inCurrentMonth = isSameMonth(day, currentMonth);
                            const today = formatDateKey(new Date()) === key;

                            return (
                                <div
                                    key={key}
                                    className={`flex min-h-[130px] flex-col gap-2 rounded-2xl border p-2 ${
                                        inCurrentMonth
                                            ? "border-[#d7e8e1] bg-white"
                                            : "border-slate-200 bg-slate-50 opacity-60"
                                    } ${today ? "ring-2 ring-[#3f977b]" : ""}`}
                                >
                                    <div
                                        className={`text-sm font-semibold ${
                                            inCurrentMonth ? "text-[#163c35]" : "text-slate-400"
                                        }`}
                                    >
                                        {day.getDate()}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        {dayEvents.map((event) => (
                                            <Link
                                                key={`${event.id}-${key}`}
                                                to={`/events/${event.id}`}
                                                className="line-clamp-2 rounded-lg bg-[#d7e8e1] px-2 py-1 text-xs text-[#163c35] transition hover:bg-[#a7cfc1]"
                                                title={event.titleEn || event.title}
                                            >
                                                {event.titleEn && lang === "en" ? event.titleEn : event.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
