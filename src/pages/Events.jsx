import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import SearchBar from "../components/SearchBar";
import EventsCalendar from "../components/EventsCalendar";
import { getEvents } from "../data/loader";

export default function Events() {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("upcoming");

    useEffect(() => {
        getEvents().then((data) => {
            setEvents(data);
        });
    }, []);

    const filteredEvents = useMemo(() => {
        const today = new Date();
        const term = search.toLowerCase();

        return events
            .filter((event) => {
                const start = new Date(event.startDate || event.date);
                const end = new Date(event.endDate || event.startDate || event.date);

                if (filterType === "upcoming" && end < today) return false;
                if (filterType === "past" && end >= today) return false;

                return (
                    event.title?.toLowerCase().includes(term) ||
                    event.location?.toLowerCase().includes(term) ||
                    event.content?.toLowerCase().includes(term)
                );
            })
            .sort((a, b) => {
                const aStart = new Date(a.startDate || a.date);
                const bStart = new Date(b.startDate || b.date);

                if (filterType === "past") {
                    return bStart - aStart;
                }
                return aStart - bStart;
            });
    }, [events, search, filterType]);

    function formatEventDate(event) {
        const start = event.startDate || event.date;
        const end = event.endDate || event.startDate || event.date;

        if (!start) return "";

        if (!end || start === end) {
            return start;
        }

        return `Du ${start} au ${end}`;
    }

    return (
        <Layout>
            <section className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#163c35]">
                    Événements
                </h1>
                <p className="mt-2 text-slate-600 max-w-2xl text-sm sm:text-base">
                    Consultez le calendrier communal et les événements à venir.
                </p>
            </section>

            {/* 📅 CALENDRIER */}
            <section className="mb-8">
                <EventsCalendar events={events} />
            </section>

            {/* 🔍 RECHERCHE */}
            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher un événement..."
            />

            {/* 🎛️ FILTRES */}
            <div className="mb-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => setFilterType("upcoming")}
                    className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${
                        filterType === "upcoming"
                            ? "bg-[#1f5e54] text-white"
                            : "bg-white border border-[#a7cfc1] text-[#1f5e54]"
                    }`}
                >
                    À venir
                </button>

                <button
                    type="button"
                    onClick={() => setFilterType("past")}
                    className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${
                        filterType === "past"
                            ? "bg-[#1f5e54] text-white"
                            : "bg-white border border-[#a7cfc1] text-[#1f5e54]"
                    }`}
                >
                    Passés
                </button>

                <button
                    type="button"
                    onClick={() => setFilterType("all")}
                    className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${
                        filterType === "all"
                            ? "bg-[#1f5e54] text-white"
                            : "bg-white border border-[#a7cfc1] text-[#1f5e54]"
                    }`}
                >
                    Tous
                </button>
            </div>

            {/* 📋 LISTE */}
            <section>
                {filteredEvents.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredEvents.map((event) => (
                            <Card
                                key={event.id}
                                title={event.title}
                                date={formatEventDate(event)}
                                image={event.image}
                            >
                                <p className="text-slate-700 text-sm sm:text-base">
                                    {event.location}
                                </p>

                                <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                                    {event.content}
                                </p>

                                <Link
                                    to={`/events/${event.id}`}
                                    className="text-[#1f5e54] hover:text-[#3f977b] hover:underline mt-3 inline-block"
                                >
                                    Voir le détail →
                                </Link>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-600">
                        Aucun événement ne correspond à votre recherche.
                    </div>
                )}
            </section>
        </Layout>
    );
}