import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import EventsCalendar from "../components/EventsCalendar";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import { getEvents } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";
import { compareEventsByStartDate, getEventEndDate, getEventStartDate, getRecurrenceLabel, parseLocalDate } from "../utils/events";

function getStartOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function formatDisplayDate(value, lang) {
    const date = parseLocalDate(value);
    if (!date) return "";

    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(date);
}

function formatCompactDate(value, lang) {
    const date = parseLocalDate(value);
    if (!date) return "";

    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
        day: "numeric",
        month: "short",
    }).format(date);
}

function formatEventDate(event, lang) {
    const start = getEventStartDate(event);
    const end = getEventEndDate(event);

    if (!start) return "";
    if (!end || start === end) return formatDisplayDate(start, lang);

    return lang === "en"
        ? `${formatCompactDate(start, lang)} to ${formatDisplayDate(end, lang)}`
        : `${formatCompactDate(start, lang)} au ${formatDisplayDate(end, lang)}`;
}

function getEventSnippet(content) {
    if (!content) return "";

    const firstSentence = content
        .split(/\r?\n/)
        .map((part) => part.trim())
        .find(Boolean)
        ?.split(/(?<=[.!?])\s+/)[0];

    if (!firstSentence) return "";
    return firstSentence.length > 150 ? `${firstSentence.slice(0, 147)}...` : firstSentence;
}

function getEventStatus(event, lang) {
    const today = getStartOfToday();
    const start = parseLocalDate(getEventStartDate(event));
    const end = parseLocalDate(getEventEndDate(event));

    if (!start || !end) {
        return lang === "en" ? "Coming up" : "A venir";
    }

    const diffDays = Math.floor((start - today) / 86400000);

    if (today >= start && today <= end) return lang === "en" ? "Happening now" : "En ce moment";
    if (diffDays === 0) return lang === "en" ? "Today" : "Aujourd'hui";
    if (diffDays > 0 && diffDays <= 6) return lang === "en" ? "This week" : "Cette semaine";
    if (diffDays > 6) return lang === "en" ? "Later" : "Plus tard";
    return lang === "en" ? "Past" : "Passe";
}

function getEventDecisionHint(event, lang) {
    const today = getStartOfToday();
    const start = parseLocalDate(getEventStartDate(event));
    const end = parseLocalDate(getEventEndDate(event));

    if (!start || !end) {
        return lang === "en" ? "Check the full details before planning your outing." : "Consultez le detail complet avant de prevoir votre sortie.";
    }

    if (today >= start && today <= end) {
        return lang === "en" ? "Open now or taking place today. Check the meeting point before you go." : "En cours aujourd'hui. Verifiez le lieu de rendez-vous avant de partir.";
    }

    const diffDays = Math.floor((start - today) / 86400000);

    if (diffDays === 0) {
        return lang === "en" ? "Good option for today. Check the location and any recurring schedule." : "Bonne option pour aujourd'hui. Verifiez le lieu et l'horaire habituel si besoin.";
    }

    if (diffDays > 0 && diffDays <= 6) {
        return lang === "en" ? "Plan it this week. Useful if you are staying a few days." : "A prevoir cette semaine. Utile si vous restez plusieurs jours.";
    }

    if (diffDays > 6) {
        return lang === "en" ? "Keep it for later and save the date now." : "A garder pour plus tard. Notez la date si cela vous interesse.";
    }

    return lang === "en" ? "This date has passed." : "Cette date est deja passee.";
}

function getTimelineKey(event) {
    const today = getStartOfToday();
    const start = parseLocalDate(getEventStartDate(event));
    const end = parseLocalDate(getEventEndDate(event));

    if (!start || !end) return "later";
    if (today >= start && today <= end) return "today";

    const diffDays = Math.floor((start - today) / 86400000);
    if (diffDays === 0) return "today";
    if (diffDays > 0 && diffDays <= 6) return "week";
    if (diffDays > 6) return "later";
    return "past";
}

function getTimelineSections(events) {
    return {
        today: events.filter((event) => getTimelineKey(event) === "today"),
        week: events.filter((event) => getTimelineKey(event) === "week"),
        later: events.filter((event) => getTimelineKey(event) === "later"),
    };
}

function EventCard({ event, lang, linkLabel }) {
    const content = getLocalizedField(event, "content", lang);

    return (
        <Card title={getLocalizedField(event, "title", lang)} date={formatEventDate(event, lang)} image={event.image}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                    {getEventStatus(event, lang)}
                </span>
                {event.recurrence && (
                    <span className="inline-flex rounded-full border border-[#d5e6df] px-3 py-1 text-xs font-medium text-[#41665e]">
                        {getRecurrenceLabel(event, lang)}
                    </span>
                )}
            </div>
            <p className="text-sm font-medium text-slate-700 sm:text-base">{getLocalizedField(event, "location", lang)}</p>
            <p className="mt-2 text-sm text-slate-600">{getEventSnippet(content)}</p>
            <p className="mt-3 text-sm text-[#355d55]">{getEventDecisionHint(event, lang)}</p>
            <Link to={`/events/${event.id}`} className="mt-4 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline">
                {linkLabel}
            </Link>
        </Card>
    );
}

export default function Events() {
    const { lang, t } = useLocale();
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("upcoming");

    useEffect(() => {
        getEvents().then((data) => {
            setEvents(data);
        });
    }, []);

    const filteredEvents = useMemo(() => {
        const today = getStartOfToday();
        const term = search.toLowerCase();

        return events
            .filter((event) => {
                const end = parseLocalDate(getEventEndDate(event));

                if (!end) return false;

                if (filterType === "upcoming" && end < today) return false;
                if (filterType === "past" && end >= today) return false;

                return (
                    getLocalizedField(event, "title", lang).toLowerCase().includes(term) ||
                    getLocalizedField(event, "location", lang).toLowerCase().includes(term) ||
                    getLocalizedField(event, "content", lang).toLowerCase().includes(term)
                );
            })
            .sort((a, b) => (filterType === "past" ? compareEventsByStartDate(b, a) : compareEventsByStartDate(a, b)));
    }, [events, filterType, lang, search]);

    const nearestEvent = filteredEvents[0] || null;
    const timelineSections = filterType === "upcoming" ? getTimelineSections(filteredEvents) : null;
    const sectionConfig = [
        {
            key: "today",
            title: lang === "en" ? "Today and happening now" : "Aujourd'hui et en cours",
            description: lang === "en" ? "Best options if you want to go out right away." : "Les meilleures options si vous cherchez une sortie tout de suite.",
        },
        {
            key: "week",
            title: lang === "en" ? "This week" : "Cette semaine",
            description: lang === "en" ? "Easy to plan if you are here for a few days." : "A programmer facilement si vous restez plusieurs jours.",
        },
        {
            key: "later",
            title: lang === "en" ? "Later on" : "Plus tard",
            description: lang === "en" ? "Save these dates for a future visit." : "A garder en tete pour une prochaine venue.",
        },
    ];

    return (
        <Layout>
            <section className="mb-6">
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6">
                    <p className="section-kicker">{lang === "en" ? "Local agenda" : "Agenda local"}</p>
                    <h1 className="mt-2 text-3xl text-[#163c35] sm:text-4xl">{lang === "en" ? "Choose an outing quickly" : "Choisir une sortie rapidement"}</h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                        {lang === "en"
                            ? "See what is happening today, this week or later, with the closest events surfaced first."
                            : "Reperez d'abord ce qui se passe aujourd'hui, cette semaine ou plus tard, avec les evenements les plus proches en tete."}
                    </p>
                </div>
            </section>

            {nearestEvent && filterType !== "past" && (
                <section className="mb-8">
                    <div className="surface-card rounded-[1.85rem] border border-[#dbe9e3] p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6">
                        <p className="section-kicker">{lang === "en" ? "Closest event" : "Le plus proche"}</p>
                        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-2xl">
                                <h2 className="text-2xl text-[#163c35] sm:text-3xl">{getLocalizedField(nearestEvent, "title", lang)}</h2>
                                <p className="mt-2 text-sm font-medium text-[#355d55] sm:text-base">
                                    {formatEventDate(nearestEvent, lang)} {getLocalizedField(nearestEvent, "location", lang) ? `- ${getLocalizedField(nearestEvent, "location", lang)}` : ""}
                                </p>
                                <p className="mt-3 text-sm text-slate-600 sm:text-base">{getEventSnippet(getLocalizedField(nearestEvent, "content", lang))}</p>
                                <p className="mt-3 text-sm text-[#355d55]">{getEventDecisionHint(nearestEvent, lang)}</p>
                            </div>
                            <div className="flex flex-col gap-2 lg:min-w-[220px]">
                                <span className="inline-flex w-fit rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                    {getEventStatus(nearestEvent, lang)}
                                </span>
                                {nearestEvent.recurrence && (
                                    <span className="text-sm text-slate-600">{getRecurrenceLabel(nearestEvent, lang)}</span>
                                )}
                                <Link
                                    to={`/events/${nearestEvent.id}`}
                                    className="inline-flex w-fit items-center rounded-full bg-[#1f5e54] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#174740]"
                                >
                                    {t("common.viewDetails")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="mb-8">
                <EventsCalendar events={events} />
            </section>

            <div className="surface-card mb-6 rounded-[1.75rem] border border-white/70 p-4 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder={lang === "en" ? "Search by event, place or theme..." : "Rechercher par evenement, lieu ou theme..."}
                />

                <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                    <button type="button" onClick={() => setFilterType("upcoming")} className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${filterType === "upcoming" ? "bg-[#1f5e54] text-white" : "border border-[#a7cfc1] bg-white text-[#1f5e54]"}`}>
                        {lang === "en" ? "Upcoming" : "A venir"}
                    </button>
                    <button type="button" onClick={() => setFilterType("past")} className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${filterType === "past" ? "bg-[#1f5e54] text-white" : "border border-[#a7cfc1] bg-white text-[#1f5e54]"}`}>
                        {lang === "en" ? "Past" : "Passes"}
                    </button>
                    <button type="button" onClick={() => setFilterType("all")} className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${filterType === "all" ? "bg-[#1f5e54] text-white" : "border border-[#a7cfc1] bg-white text-[#1f5e54]"}`}>
                        {lang === "en" ? "All dates" : "Toutes les dates"}
                    </button>
                </div>
            </div>

            <section>
                {filteredEvents.length > 0 ? (
                    filterType === "upcoming" ? (
                        <div className="space-y-8">
                            {sectionConfig.map((section) => {
                                const sectionEvents = timelineSections?.[section.key] || [];
                                if (sectionEvents.length === 0) return null;

                                return (
                                    <div key={section.key}>
                                        <div className="mb-4">
                                            <h2 className="text-2xl text-[#163c35]">{section.title}</h2>
                                            <p className="mt-1 text-sm text-slate-600 sm:text-base">{section.description}</p>
                                        </div>
                                        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                                            {sectionEvents.map((event) => (
                                                <EventCard key={event.id} event={event} lang={lang} linkLabel={t("common.viewDetails")} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {filteredEvents.map((event) => (
                                <EventCard key={event.id} event={event} lang={lang} linkLabel={t("common.viewDetails")} />
                            ))}
                        </div>
                    )
                ) : (
                    <div className="surface-card rounded-[1.75rem] border border-white/70 p-5 text-slate-600 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                        {lang === "en"
                            ? "No event matches your search or the selected period."
                            : "Aucun evenement ne correspond a votre recherche ou a la periode choisie."}
                    </div>
                )}
            </section>
        </Layout>
    );
}
