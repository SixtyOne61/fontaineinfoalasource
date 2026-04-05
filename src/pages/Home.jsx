import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import CoverImage from "../components/CoverImage";
import { getNews, getEvents, getHikes } from "../data/loader";

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
            <section className="rounded-3xl bg-gradient-to-r from-[#1f5e54] to-[#3f977b] text-white p-5 sm:p-8 md:p-12 shadow-lg mb-8 sm:mb-10">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-6">
                    <img
                        src="/logo-fontaine.png"
                        alt="Logo Fontaine-de-Vaucluse"
                        className="h-20 w-20 sm:h-28 sm:w-28 object-contain"
                    />

                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
                            Fontaine Info à la Source
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl max-w-2xl text-[#eef7f3]">
                            Retrouvez les actualités, les événements à venir et les itinéraires de randonnée
                            de la commune sur une seule plateforme.
                        </p>
                    </div>
                </div>
            </section>

            {featuredNews && (
                <section className="mb-10 sm:mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#163c35]">À la une</h2>
                        <Link
                            to="/news"
                            className="text-[#1f5e54] hover:text-[#3f977b] hover:underline font-medium text-sm sm:text-base"
                        >
                            Voir toutes les actualités
                        </Link>
                    </div>

                    <article className="grid overflow-hidden rounded-3xl border border-[#d7e8e1] bg-white shadow-sm md:grid-cols-2">
                        <CoverImage
                            src={featuredNews.image}
                            alt={featuredNews.title}
                            className="h-56 sm:h-72 w-full object-cover md:h-full"
                        />

                        <div className="p-5 sm:p-8 flex flex-col justify-center">
                            <p className="text-sm text-[#5b7d76] mb-2">{featuredNews.date}</p>
                            <h3 className="text-2xl sm:text-3xl font-bold text-[#163c35] mb-4">
                                {featuredNews.title}
                            </h3>
                            <p className="text-slate-700 mb-6 text-sm sm:text-base">
                                {featuredNews.excerpt || featuredNews.content}
                            </p>
                            <Link
                                to={`/news/${featuredNews.id}`}
                                className="text-[#1f5e54] hover:text-[#3f977b] hover:underline font-medium"
                            >
                                Lire l’actualité →
                            </Link>
                        </div>
                    </article>
                </section>
            )}

            <section className="mb-10 sm:mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#163c35]">Dernières actualités</h2>
                    <Link
                        to="/news"
                        className="text-[#1f5e54] hover:text-[#3f977b] hover:underline font-medium text-sm sm:text-base"
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
                                className="text-[#1f5e54] hover:text-[#3f977b] hover:underline mt-3 inline-block"
                            >
                                Lire plus →
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mb-10 sm:mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#163c35]">Prochains événements</h2>
                    <Link
                        to="/events"
                        className="text-[#1f5e54] hover:text-[#3f977b] hover:underline font-medium text-sm sm:text-base"
                    >
                        Voir tous les événements
                    </Link>
                </div>

                <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {events.map((event) => (
                        <Card key={event.id} title={event.title} date={event.date} image={event.image}>
                            <p className="text-sm text-slate-700">{event.location}</p>
                            <Link
                                to={`/events/${event.id}`}
                                className="text-[#1f5e54] hover:text-[#3f977b] hover:underline mt-3 inline-block"
                            >
                                Voir le détail →
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#163c35]">Randonnées à découvrir</h2>
                    <Link
                        to="/hikes"
                        className="text-[#1f5e54] hover:text-[#3f977b] hover:underline font-medium text-sm sm:text-base"
                    >
                        Voir toutes les randonnées
                    </Link>
                </div>

                <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {hikes.map((hike) => (
                        <article
                            key={hike.id}
                            className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5"
                        >
                            <h3 className="text-xl font-bold text-slate-900">{hike.name}</h3>
                            <p className="mt-2 text-sm text-slate-700">Distance : {hike.distance} km</p>
                            <p className="text-sm text-slate-700">Difficulté : {hike.difficulty}</p>
                            <Link
                                to={`/hikes/${hike.id}`}
                                className="text-[#1f5e54] hover:text-[#3f977b] hover:underline mt-3 inline-block"
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