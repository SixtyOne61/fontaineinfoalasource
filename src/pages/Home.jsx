import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { getNews, getEvents, getHikes } from "../data/loader";

export default function Home() {
    const [news, setNews] = useState([]);
    const [events, setEvents] = useState([]);
    const [hikes, setHikes] = useState([]);

    useEffect(() => {
        getNews().then((data) => {
            const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
            setNews(sorted.slice(0, 3));
        });

        getEvents().then((data) => {
            const today = new Date();
            const upcoming = data
                .filter((event) => new Date(event.date) >= today)
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            setEvents(upcoming.slice(0, 3));
        });

        getHikes().then((data) => {
            setHikes(data.slice(0, 3));
        });
    }, []);

    return (
        <Layout>
            <section className="rounded-3xl bg-gradient-to-r from-[#1f5e54] to-[#3f977b] text-white p-8 md:p-12 shadow-lg mb-10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <img
                        src="/logo-fontaine.png"
                        alt="Logo Fontaine de Vaucluse"
                        className="h-28 w-28 object-contain"
                    />

                    <div>
                        <h1 className="text-4xl font-bold mb-4">Fontaine Info à la Source</h1>
                        <p className="text-lg md:text-xl max-w-2xl text-[#eef7f3]">
                            Retrouvez les actualités, les événements à venir et les itinéraires de randonnée
                            de la commune sur une seule plateforme.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Dernières actualités</h2>
                    <Link to="/news" className="text-[#1f5e54] font-medium hover:underline">
                        Voir toutes les actualités
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {news.map((item) => (
                        <Card key={item.id} title={item.title} date={item.date}>
                            <p className="text-sm text-slate-700">{item.excerpt}</p>
                            <Link to={`/news/${item.id}`} className="text-[#1f5e54] mt-3 inline-block">
                                Lire plus →
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Prochains événements</h2>
                    <Link to="/events" className="text-[#1f5e54] font-medium hover:underline">
                        Voir tous les événements
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {events.map((event) => (
                        <Card key={event.id} title={event.title} date={event.date}>
                            <p className="text-sm text-slate-700">{event.location}</p>
                            <Link
                                to={`/events/${event.id}`}
                                className="text-[#1f5e54] mt-3 inline-block hover:underline"
                            >
                                Voir le détail →
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Randonnées à découvrir</h2>
                    <Link to="/hikes" className="text-[#1f5e54] font-medium hover:underline">
                        Voir toutes les randonnées
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {hikes.map((hike) => (
                        <Card key={hike.id} title={hike.name}>
                            <p className="text-sm text-slate-700">Distance : {hike.distance} km</p>
                            <p className="text-sm text-slate-700">Difficulté : {hike.difficulty}</p>
                            <Link
                                to={`/hikes/${hike.id}`}
                                className="text-[#1f5e54] mt-3 inline-block hover:underline"
                            >
                                Voir le détail →
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>
        </Layout>
    );
}