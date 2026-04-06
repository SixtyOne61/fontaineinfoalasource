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
        if (!end || start === end) return start;

        return `Du ${start} au ${end}`;
    }

    return (
        <Layout>
            <section className="mb-8">
                <h1 className="text-2xl font-bold text-[#163c35] sm:text-3xl">Événements</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                    Consultez le calendrier communal et les événements à venir.
                </p>
            </section>

            <section className="mb-8">
                <EventsCalendar events={events} />
            </section>

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher un événement..."
            />

            <div className="mb-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <button
                    type="button"
                    onClick={() => setFilterType("upcoming")}
                    className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${
                        filterType === "upcoming"
                            ? "bg-[#1f5e54] text-white"
                            : "border border-[#a7cfc1] bg-white text-[#1f5e54]"
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
                            : "border border-[#a7cfc1] bg-white text-[#1f5e54]"
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
                            : "border border-[#a7cfc1] bg-white text-[#1f5e54]"
                    }`}
                >
                    Tous
                </button>
            </div>

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
                                <p className="text-sm text-slate-700 sm:text-base">{event.location}</p>

                                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                                    {event.content}
                                </p>

                                <Link
                                    to={`/events/${event.id}`}
                                    className="mt-3 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                                >
                                    Voir le détail →
                                </Link>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">
                        Aucun événement ne correspond à votre recherche.
                    </div>
                )}
            </section>
        </Layout>
    );
}
