import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import CoverImage from "../components/CoverImage";
import { getEvents, getHikes, getNews, getParkings } from "../data/loader";

const quickLinks = [
    { title: "Se garer", description: "Repérer rapidement les parkings utiles.", to: "/parking" },
    { title: "Que faire aujourd'hui", description: "Voir les animations proches.", to: "/events" },
    { title: "Choisir une balade", description: "Comparer les randonnées faciles.", to: "/hikes" },
];

function formatEventDate(event) {
    if (event.startDate === event.endDate || !event.endDate) {
        return event.startDate || event.date;
    }

    return `Du ${event.startDate} au ${event.endDate}`;
}

function getEventStatus(startDate, endDate) {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate || startDate);
    const diffDays = Math.floor((start - today) / (1000 * 60 * 60 * 24));

    if (today >= start && today <= end) return "En cours";
    if (diffDays <= 0) return "Aujourd'hui";
    if (diffDays <= 6) return "Cette semaine";
    return "À venir";
}

export default function Home() {
    const [featuredNews, setFeaturedNews] = useState(null);
    const [news, setNews] = useState([]);
    const [events, setEvents] = useState([]);
    const [hikes, setHikes] = useState([]);
    const [parkings, setParkings] = useState([]);

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

        getParkings().then((data) => {
            setParkings(data.slice(0, 2));
        });
    }, []);

    const practicalHighlights = useMemo(() => {
        const nextEvent = events[0];
        const easyHikeCount = hikes.filter((hike) => hike.difficulty === "Facile").length;

        return [
            { label: "Parkings repérés", value: parkings.length > 0 ? `${parkings.length} options` : "À vérifier" },
            { label: "Prochain événement", value: nextEvent ? nextEvent.title : "Aucun programmé" },
            { label: "Balades faciles", value: easyHikeCount > 0 ? `${easyHikeCount} parcours` : "À enrichir" },
        ];
    }, [events, hikes, parkings]);

    return (
        <Layout>
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/20 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_30%),linear-gradient(135deg,#18463e,#27685b_54%,#d3bc8d)] p-5 text-white shadow-[0_28px_90px_rgba(22,60,53,0.18)] sm:mb-10 sm:p-8 md:p-10">
                <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
                    <div>
                        <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/12 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur-sm">
                            Guide pratique visiteurs et habitants
                        </div>
                        <div className="mb-5 flex items-center gap-4">
                            <img
                                src="/logo-fontaine.png"
                                alt="Logo Fontaine-de-Vaucluse"
                                className="h-16 w-16 rounded-[1.35rem] bg-white/10 p-2 object-contain shadow-lg sm:h-20 sm:w-20"
                            />
                            <div>
                                <h1 className="text-3xl leading-tight text-white sm:text-5xl">
                                    Fontaine Info à la Source
                                </h1>
                                <p className="mt-3 max-w-2xl text-base text-[#eef7f3] sm:text-lg">
                                    Les informations utiles pour mieux orienter les visiteurs en période de forte fréquentation.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/16"
                                >
                                    <p className="text-lg font-semibold text-white">{link.title}</p>
                                    <p className="mt-2 text-sm text-white/85">{link.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3 rounded-[1.75rem] border border-white/15 bg-[#163c35]/40 p-4 backdrop-blur-md">
                        <p className="section-kicker text-[#d7e8e1]">En un coup d'œil</p>
                        {practicalHighlights.map((item) => (
                            <div key={item.label} className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-sm text-[#d7e8e1]">{item.label}</p>
                                <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Link to="/parking" className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(22,60,53,0.14)]">
                    <p className="section-kicker">Priorité accès</p>
                    <h2 className="mt-2 text-xl text-[#163c35]">Trouver un parking</h2>
                    <p className="mt-2 text-sm text-slate-600">Comparez tarifs, accès véhicules et position sur la carte.</p>
                </Link>
                <Link to="/events" className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(22,60,53,0.14)]">
                    <p className="section-kicker">Agenda</p>
                    <h2 className="mt-2 text-xl text-[#163c35]">Voir les événements</h2>
                    <p className="mt-2 text-sm text-slate-600">Repérez ce qui se passe aujourd'hui et cette semaine.</p>
                </Link>
                <Link to="/hikes" className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(22,60,53,0.14)]">
                    <p className="section-kicker">Nature</p>
                    <h2 className="mt-2 text-xl text-[#163c35]">Choisir une balade</h2>
                    <p className="mt-2 text-sm text-slate-600">Sélectionnez un parcours selon la difficulté et la durée.</p>
                </Link>
                <Link to="/news" className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(22,60,53,0.14)]">
                    <p className="section-kicker">Infos pratiques</p>
                    <h2 className="mt-2 text-xl text-[#163c35]">Consulter les actus</h2>
                    <p className="mt-2 text-sm text-slate-600">Suivez les informations utiles liées à l'accueil et à la circulation.</p>
                </Link>
            </section>

            {featuredNews && (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">À la une</h2>
                        <Link to="/news" className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base">
                            Voir toutes les actualités
                        </Link>
                    </div>
                    <article className="surface-card grid overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_18px_60px_rgba(22,60,53,0.08)] md:grid-cols-2">
                        <CoverImage src={featuredNews.image} alt={featuredNews.title} className="h-56 w-full object-cover sm:h-72 md:h-full" />
                        <div className="flex flex-col justify-center p-6 sm:p-8">
                            <div className="section-kicker mb-3 inline-flex w-fit rounded-full bg-[#eef7f3] px-3 py-1 text-[#1f5e54]">
                                Information utile
                            </div>
                            <p className="mb-2 text-sm text-[#5b7d76]">{featuredNews.date}</p>
                            <h3 className="mb-4 text-3xl text-[#163c35]">{featuredNews.title}</h3>
                            <p className="mb-6 text-sm text-slate-700 sm:text-base">{featuredNews.excerpt || featuredNews.content}</p>
                            <Link to={`/news/${featuredNews.id}`} className="font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline">
                                Lire l’actualité →
                            </Link>
                        </div>
                    </article>
                </section>
            )}

            {parkings.length > 0 && (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">Se garer facilement</h2>
                        <Link to="/parking" className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base">
                            Voir tous les parkings
                        </Link>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {parkings.map((parking) => (
                            <article key={parking.id} className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl text-[#163c35]">{parking.name}</h3>
                                        <p className="mt-2 text-sm text-slate-600">{parking.address}</p>
                                    </div>
                                    <span className="rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                        {parking.dailyRate}
                                    </span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                    {parking.cars && <span className="rounded-full bg-slate-100 px-3 py-1">Voitures</span>}
                                    {parking.motorcycles && <span className="rounded-full bg-slate-100 px-3 py-1">Motos</span>}
                                    {parking.campers && <span className="rounded-full bg-slate-100 px-3 py-1">Camping-cars</span>}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            <section className="mb-10 sm:mb-12">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-2xl text-[#163c35] sm:text-3xl">Prochains événements</h2>
                    <Link to="/events" className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base">
                        Voir tous les événements
                    </Link>
                </div>
                <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {events.map((event) => (
                        <Card key={event.id} title={event.title} date={formatEventDate(event)} image={event.image}>
                            <div className="mb-3 inline-flex rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                {getEventStatus(event.startDate || event.date, event.endDate)}
                            </div>
                            <p className="text-sm text-slate-700">{event.location}</p>
                            <Link to={`/events/${event.id}`} className="mt-3 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline">
                                Voir le détail →
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="mb-10 sm:mb-12">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-2xl text-[#163c35] sm:text-3xl">Dernières actualités</h2>
                    <Link to="/news" className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base">
                        Voir toutes les actualités
                    </Link>
                </div>
                <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {news.map((item) => (
                        <Card key={item.id} title={item.title} date={item.date} image={item.image}>
                            <p className="text-sm text-slate-700">{item.excerpt}</p>
                            <Link to={`/news/${item.id}`} className="mt-3 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline">
                                Lire plus →
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-2xl text-[#163c35] sm:text-3xl">Randonnées à découvrir</h2>
                    <Link to="/hikes" className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base">
                        Voir toutes les randonnées
                    </Link>
                </div>
                <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {hikes.map((hike) => (
                        <article key={hike.id} className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                            <div className="mb-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">{hike.difficulty}</span>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{hike.duration}</span>
                            </div>
                            <h3 className="text-2xl text-slate-900">{hike.name}</h3>
                            <p className="mt-2 text-sm text-slate-700">{hike.description}</p>
                            <p className="mt-3 text-sm text-slate-600">Distance : {hike.distance} km</p>
                            <Link to={`/hikes/${hike.id}`} className="mt-4 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline">
                                Voir le détail →
                            </Link>
                        </article>
                    ))}
                </div>
            </section>
        </Layout>
    );
}
