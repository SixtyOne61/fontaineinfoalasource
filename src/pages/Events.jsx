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

function getEventSnippet(content) {
    if (!content) return "";
    return content.length > 140 ? `${content.slice(0, 137)}...` : content;
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

    function getEventStatus(event) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = parseLocalDate(getEventStartDate(event));
        const end = parseLocalDate(getEventEndDate(event));

        if (!start || !end) {
            return t("common.upcoming");
        }

        const diffDays = Math.floor((start - today) / (1000 * 60 * 60 * 24));

        if (today >= start && today <= end) return t("common.inProgress");
        if (diffDays === 0) return t("common.today");
        if (diffDays > 0 && diffDays <= 6) return t("common.thisWeek");
        return t("common.upcoming");
    }

    const filteredEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
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

    function formatEventDate(event) {
        const start = getEventStartDate(event);
        const end = getEventEndDate(event);

        if (!start) return "";
        if (!end || start === end) return start;

        return lang === "en" ? `From ${start} to ${end}` : `Du ${start} au ${end}`;
    }

    return (
        <Layout>
            <section className="mb-6">
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6">
                    <p className="section-kicker">{lang === "en" ? "Local agenda" : "Agenda communal"}</p>
                    <h1 className="mt-2 text-3xl text-[#163c35] sm:text-4xl">{lang === "en" ? "Events" : "Événements"}</h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                        {lang === "en"
                            ? "Quickly browse the local calendar and see what is happening today, this week or later."
                            : "Consultez rapidement le calendrier communal et repérez ce qui se passe aujourd'hui, cette semaine ou plus tard."}
                    </p>
                </div>
            </section>

            <section className="mb-8">
                <EventsCalendar events={events} />
            </section>

            <div className="surface-card mb-6 rounded-[1.75rem] border border-white/70 p-4 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder={lang === "en" ? "Search an event or a place..." : "Rechercher un événement ou un lieu..."}
                />

                <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                    <button type="button" onClick={() => setFilterType("upcoming")} className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${filterType === "upcoming" ? "bg-[#1f5e54] text-white" : "border border-[#a7cfc1] bg-white text-[#1f5e54]"}`}>
                        {lang === "en" ? "Upcoming" : "À venir"}
                    </button>
                    <button type="button" onClick={() => setFilterType("past")} className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${filterType === "past" ? "bg-[#1f5e54] text-white" : "border border-[#a7cfc1] bg-white text-[#1f5e54]"}`}>
                        {lang === "en" ? "Past" : "Passés"}
                    </button>
                    <button type="button" onClick={() => setFilterType("all")} className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${filterType === "all" ? "bg-[#1f5e54] text-white" : "border border-[#a7cfc1] bg-white text-[#1f5e54]"}`}>
                        {lang === "en" ? "All" : "Tous"}
                    </button>
                </div>
            </div>

            <section>
                {filteredEvents.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredEvents.map((event) => (
                            <Card key={event.id} title={getLocalizedField(event, "title", lang)} date={formatEventDate(event)} image={event.image}>
                                <div className="mb-3 inline-flex rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                    {getEventStatus(event)}
                                </div>
                                <p className="text-sm font-medium text-slate-700 sm:text-base">{getLocalizedField(event, "location", lang)}</p>
                                {event.recurrence && (
                                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-[#5b7d76]">
                                        {getRecurrenceLabel(event, lang)}
                                    </p>
                                )}
                                <p className="mt-2 text-sm text-slate-600">{getEventSnippet(getLocalizedField(event, "content", lang))}</p>
                                <Link to={`/events/${event.id}`} className="mt-3 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline">
                                    {t("common.viewDetails")}
                                </Link>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="surface-card rounded-[1.75rem] border border-white/70 p-5 text-slate-600 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                        {lang === "en" ? "No event matches your search." : "Aucun événement ne correspond à votre recherche."}
                    </div>
                )}
            </section>
        </Layout>
    );
}
