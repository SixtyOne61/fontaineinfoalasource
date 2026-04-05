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
                const eventDate = new Date(event.date);

                if (filterType === "upcoming" && eventDate < today) return false;
                if (filterType === "past" && eventDate >= today) return false;

                return (
                    event.title?.toLowerCase().includes(term) ||
                    event.location?.toLowerCase().includes(term) ||
                    event.content?.toLowerCase().includes(term)
                );
            })
            .sort((a, b) => {
                if (filterType === "past") {
                    return new Date(b.date) - new Date(a.date);
                }
                return new Date(a.date) - new Date(b.date);
            });
    }, [events, search, filterType]);

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6 text-[#163c35]">Événements</h1>

            <div className="mb-8">
                <EventsCalendar events={events} />
            </div>

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher un événement..."
            />

            <div className="mb-6 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => setFilterType("upcoming")}
                    className={`rounded-xl px-4 py-2 ${
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
                    className={`rounded-xl px-4 py-2 ${
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
                    className={`rounded-xl px-4 py-2 ${
                        filterType === "all"
                            ? "bg-[#1f5e54] text-white"
                            : "bg-white border border-[#a7cfc1] text-[#1f5e54]"
                    }`}
                >
                    Tous
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <Card
                            key={event.id}
                            title={event.title}
                            date={event.date}
                            image={event.image}
                        >
                            <p className="text-slate-700">{event.location}</p>
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
                    ))
                ) : (
                    <p className="text-slate-600">Aucun événement ne correspond à votre recherche.</p>
                )}
            </div>
        </Layout>
    );
}