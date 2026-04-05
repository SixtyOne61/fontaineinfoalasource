import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

function formatDateKey(date) {
    return date.toISOString().split("T")[0];
}

function isSameMonth(date, currentDate) {
    return (
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
    );
}

function getMonthLabel(date) {
    return date.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
    });
}

function getCalendarDays(currentMonth) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = (firstDayOfMonth.getDay() + 6) % 7;
    const calendarStart = new Date(year, month, 1 - startDay);

    const days = [];
    for (let i = 0; i < 42; i++) {
        const day = new Date(calendarStart);
        day.setDate(calendarStart.getDate() + i);
        days.push(day);
    }

    return days;
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

            const allDates = getDatesInRange(start, end);

            allDates.forEach((dateKey) => {
                if (!map[dateKey]) {
                    map[dateKey] = [];
                }
                map[dateKey].push(event);
            });
        });

        return map;
    }, [events]);

    const days = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

    const goToPreviousMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    };

    const goToNextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    };

    const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    return (
        <section className="rounded-3xl border border-[#d7e8e1] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#163c35] capitalize">
                    {getMonthLabel(currentMonth)}
                </h2>

                <div className="grid grid-cols-2 gap-3 sm:flex">
                    <button
                        type="button"
                        onClick={goToPreviousMonth}
                        className="rounded-xl border border-[#a7cfc1] bg-white px-4 py-2.5 text-[#1f5e54] hover:bg-[#d7e8e1] transition text-sm sm:text-base"
                    >
                        ← Précédent
                    </button>

                    <button
                        type="button"
                        onClick={goToNextMonth}
                        className="rounded-xl border border-[#a7cfc1] bg-white px-4 py-2.5 text-[#1f5e54] hover:bg-[#d7e8e1] transition text-sm sm:text-base"
                    >
                        Suivant →
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-center text-sm font-semibold text-[#5b7d76] py-2"
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
                                    className={`min-h-[130px] rounded-2xl border p-2 flex flex-col gap-2 ${
                                        inCurrentMonth
                                            ? "bg-white border-[#d7e8e1]"
                                            : "bg-slate-50 border-slate-200 opacity-60"
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
                                                className="rounded-lg bg-[#d7e8e1] px-2 py-1 text-xs text-[#163c35] hover:bg-[#a7cfc1] transition line-clamp-2"
                                                title={event.title}
                                            >
                                                {event.title}
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