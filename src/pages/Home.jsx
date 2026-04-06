import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import CoverImage from "../components/CoverImage";
import { getNews, getEvents, getHikes } from "../data/loader";

function formatEventDate(event) {
    if (event.startDate === event.endDate || !event.endDate) {
        return event.startDate || event.date;
    }

    return `Du ${event.startDate} au ${event.endDate}`;
}

export default function Home() {
    const [featuredNews, setFeaturedNews] = useState(null);
    const [news, setNews] = useState([]);
    const [events, setEvents] = useState([]);
    const [hikes, setHikes] = useState([]);

    useEffect(() => {
        getNews().then((data) => {
            const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
            setFeaturedNews(sorted[0] || null);
            setNews(sorted.slice(1, 4));
        });

        getEvents().then((data) => {
            const today = new Date();
            const upcoming = data
                .filter((event) => new Date(event.endDate || event.startDate || event.date) >= today)
                .sort(
                    (a, b) =>
                        new Date(a.startDate || a.date) - new Date(b.startDate || b.date)
                );
            setEvents(upcoming.slice(0, 3));
        });

        getHikes().then((data) => {
            setHikes(data.slice(0, 3));
        });
    }, []);

    return (
        <Layout>
            <section className="mb-8 rounded-3xl bg-gradient-to-r from-[#1f5e54] to-[#3f977b] p-5 text-white shadow-lg sm:mb-10 sm:p-8 md:p-12">
                <div className="flex flex-col items-start gap-5 sm:gap-6 md:flex-row md:items-center">
                    <img
                        src="/logo-fontaine.png"
                        alt="Logo Fontaine-de-Vaucluse"
                        className="h-20 w-20 object-contain sm:h-28 sm:w-28"
                    />

                    <div>
                        <h1 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-4xl">
                            Fontaine Info à la Source
                        </h1>
                        <p className="max-w-2xl text-base text-[#eef7f3] sm:text-lg md:text-xl">
                            Retrouvez les actualités, les événements à venir et les itinéraires de
                            randonnée de la commune sur une seule plateforme.
                        </p>
                    </div>
                </div>
            </section>

            {featuredNews && (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-bold text-[#163c35] sm:text-2xl">À la une</h2>
                        <Link
                            to="/news"
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            Voir toutes les actualités
                        </Link>
                    </div>

                    <article className="grid overflow-hidden rounded-3xl border border-[#d7e8e1] bg-white shadow-sm md:grid-cols-2">
                        <CoverImage
                            src={featuredNews.image}
                            alt={featuredNews.title}
                            className="h-56 w-full object-cover sm:h-72 md:h-full"
                        />

                        <div className="flex flex-col justify-center p-5 sm:p-8">
                            <p className="mb-2 text-sm text-[#5b7d76]">{featuredNews.date}</p>
                            <h3 className="mb-4 text-2xl font-bold text-[#163c35] sm:text-3xl">
                                {featuredNews.title}
                            </h3>
                            <p className="mb-6 text-sm text-slate-700 sm:text-base">
                                {featuredNews.excerpt || featuredNews.content}
                            </p>
                            <Link
                                to={`/news/${featuredNews.id}`}
                                className="font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                            >
                                Lire l’actualité →
                            </Link>
                        </div>
                    </article>
                </section>
            )}

            <section className="mb-10 sm:mb-12">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-bold text-[#163c35] sm:text-2xl">
                        Dernières actualités
                    </h2>
                    <Link
                        to="/news"
                        className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                    >
                        Voir toutes les actualités
                    </Link>
                </div>

                <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {news.map((item) => (
                        <Card key={item.id} title={item.title} date={item.date} image={item.image}>
                            <p className="text-sm text-slate-700">{item.excerpt}</p>
                            <Link
                                to={`/news/${item.id}`}
                                className="mt-3 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                            >
                                Lire plus →
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mb-10 sm:mb-12">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-bold text-[#163c35] sm:text-2xl">
                        Prochains événements
                    </h2>
                    <Link
                        to="/events"
                        className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                    >
                        Voir tous les événements
                    </Link>
                </div>

                <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {events.map((event) => (
                        <Card
                            key={event.id}
                            title={event.title}
                            date={formatEventDate(event)}
                            image={event.image}
                        >
                            <p className="text-sm text-slate-700">{event.location}</p>
                            <Link
                                to={`/events/${event.id}`}
                                className="mt-3 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                            >
                                Voir le détail →
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-bold text-[#163c35] sm:text-2xl">
                        Randonnées à découvrir
                    </h2>
                    <Link
                        to="/hikes"
                        className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                    >
                        Voir toutes les randonnées
                    </Link>
                </div>

                <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {hikes.map((hike) => (
                        <article
                            key={hike.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-slate-900">{hike.name}</h3>
                            <p className="mt-2 text-sm text-slate-700">Distance : {hike.distance} km</p>
                            <p className="text-sm text-slate-700">Difficulté : {hike.difficulty}</p>
                            <Link
                                to={`/hikes/${hike.id}`}
                                className="mt-3 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                            >
                                Voir le détail →
                            </Link>
                        </article>
                    ))}
                </div>
            </section>
        </Layout>
    );
}
