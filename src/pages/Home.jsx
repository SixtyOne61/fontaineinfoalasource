import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import CoverImage from "../components/CoverImage";
import {
    getEvents,
    getHikes,
    getNews,
    getParkings,
    getSectionVisibility,
    getSiteContent,
} from "../data/loader";
import { defaultSectionVisibility, sectionRoutes } from "../data/sections";

const quickLinks = [
    {
        key: "parkings",
        title: "Se garer",
        description: "Trouver un parking adapté à votre véhicule.",
        to: sectionRoutes.parkings,
    },
    {
        key: "events",
        title: "Que faire aujourd'hui",
        description: "Voir les animations et sorties proches.",
        to: sectionRoutes.events,
    },
    {
        key: "hikes",
        title: "Choisir une balade",
        description: "Comparer les randonnées selon votre temps.",
        to: sectionRoutes.hikes,
    },
];

const homeCards = [
    {
        key: "parkings",
        to: sectionRoutes.parkings,
        kicker: "Accès rapide",
        title: "Trouver un parking",
        description: "Comparer les accès, les tarifs et les véhicules acceptés avant d'entrer dans le village.",
    },
    {
        key: "events",
        to: sectionRoutes.events,
        kicker: "Agenda",
        title: "Voir les événements",
        description: "Repérer les rendez-vous utiles aujourd'hui, cette semaine ou plus tard.",
    },
    {
        key: "hikes",
        to: sectionRoutes.hikes,
        kicker: "Nature",
        title: "Choisir une balade",
        description: "Sélectionner un parcours selon la difficulté, la durée et le point de départ.",
    },
    {
        key: "news",
        to: sectionRoutes.news,
        kicker: "Infos pratiques",
        title: "Consulter les actus",
        description: "Suivre les messages utiles pour les visiteurs et les habitants.",
    },
];

const vehicleTypes = [
    { key: "motorcycles", label: "Moto" },
    { key: "cars", label: "Voiture" },
    { key: "minivans", label: "Mini-van" },
    { key: "campers", label: "Camping-car" },
];

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
});

function parseLocalDate(value) {
    if (typeof value !== "string" || !value) {
        return null;
    }

    const [year, month, day] = value.split("-").map((part) => Number(part));

    if (!year || !month || !day) {
        return null;
    }

    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
    const date = parseLocalDate(value);
    return date ? dateFormatter.format(date) : value || "";
}

function formatEventDate(event) {
    const start = event.startDate || event.date;
    const end = event.endDate || event.startDate || event.date;

    if (!start) {
        return "";
    }

    if (!end || start === end) {
        return formatDate(start);
    }

    return `Du ${formatDate(start)} au ${formatDate(end)}`;
}

function getEventStatus(startDate, endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = parseLocalDate(startDate);
    if (!start) {
        return "À venir";
    }

    const end = parseLocalDate(endDate || startDate) || start;
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((start - today) / (1000 * 60 * 60 * 24));

    if (today >= start && today <= end) return "En cours";
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays > 0 && diffDays <= 6) return "Cette semaine";
    return "À venir";
}

function VehicleBadge({ label, allowed }) {
    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                allowed
                    ? "bg-[#eef7f3] text-[#1f5e54]"
                    : "bg-slate-100 text-slate-500 line-through decoration-slate-400"
            }`}
        >
            {label}
        </span>
    );
}

export default function Home() {
    const [featuredNews, setFeaturedNews] = useState(null);
    const [news, setNews] = useState([]);
    const [events, setEvents] = useState([]);
    const [hikes, setHikes] = useState([]);
    const [parkings, setParkings] = useState([]);
    const [sectionVisibility, setSectionVisibility] = useState(defaultSectionVisibility);
    const [siteContent, setSiteContent] = useState(null);

    useEffect(() => {
        getSectionVisibility().then(setSectionVisibility);
        getSiteContent().then(setSiteContent);

        getNews().then((data) => {
            const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
            setFeaturedNews(sorted[0] || null);
            setNews(sorted.slice(1, 4));
        });

        getEvents().then((data) => {
            const today = new Date();
            const upcoming = data
                .filter((event) => new Date(event.endDate || event.startDate || event.date) >= today)
                .sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));

            setEvents(upcoming.slice(0, 3));
        });

        getHikes().then((data) => {
            setHikes(data.slice(0, 3));
        });

        getParkings().then((data) => {
            setParkings(data.slice(0, 2));
        });
    }, []);

    const visibleQuickLinks = useMemo(
        () =>
            (
                siteContent?.quickLinks?.length
                    ? siteContent.quickLinks.map((link) => ({ ...link, key: link.id }))
                    : quickLinks
            ).filter((link) => sectionVisibility[link.key]),
        [sectionVisibility, siteContent]
    );

    const visibleHomeCards = useMemo(
        () =>
            (
                siteContent?.quickLinks?.length
                    ? siteContent.quickLinks.map((link) => ({
                          key: link.id,
                          to: link.to,
                          kicker: link.badge || "Accès rapide",
                          title: link.title,
                          description: link.description,
                      }))
                    : homeCards
            ).filter((card) => sectionVisibility[card.key]),
        [sectionVisibility, siteContent]
    );

    const practicalHighlights = useMemo(() => {
        const nextEvent = events[0];
        const easyHikeCount = hikes.filter((hike) => hike.difficulty === "Facile").length;

        return [
            ...(siteContent?.highlights ?? []).map((item) => ({
                label: item.title,
                value: item.value,
                meta: item.description,
            })),
            sectionVisibility.parkings
                ? {
                      label: "Parkings repérés",
                      value: parkings.length > 0 ? `${parkings.length} options` : "À vérifier",
                      meta: "Places utiles avant d'entrer au coeur du village",
                  }
                : null,
            sectionVisibility.events
                ? {
                      label: "Prochain événement",
                      value: nextEvent ? nextEvent.title : "Aucun programmé",
                      meta: nextEvent ? formatEventDate(nextEvent) : "Agenda à consulter",
                  }
                : null,
            sectionVisibility.hikes
                ? {
                      label: "Balades faciles",
                      value: easyHikeCount > 0 ? `${easyHikeCount} parcours` : "À enrichir",
                      meta: "Idéal pour une sortie courte ou familiale",
                  }
                : null,
        ]
            .filter(Boolean)
            .slice(0, 4);
    }, [events, hikes, parkings, sectionVisibility, siteContent]);

    const heroTitle = siteContent?.hero?.title || "Fontaine Info à la Source";
    const heroDescription =
        siteContent?.hero?.description ||
        "Les informations utiles pour se repérer rapidement à Fontaine-de-Vaucluse : stationnement, événements, randonnées et actus de terrain.";
    const heroEyebrow = siteContent?.hero?.eyebrow || "Guide pratique visiteurs et habitants";
    const heroPrimaryCta = siteContent?.hero?.primaryCta;
    const heroSecondaryCta = siteContent?.hero?.secondaryCta;

    return (
        <Layout>
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/20 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_30%),linear-gradient(135deg,#18463e,#27685b_54%,#d3bc8d)] p-5 text-white shadow-[0_28px_90px_rgba(22,60,53,0.18)] sm:mb-10 sm:p-8 md:p-10">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                    <div className="space-y-5">
                        <div className="inline-flex rounded-full border border-white/15 bg-white/[0.12] px-3 py-1 text-sm font-medium text-white/90 backdrop-blur-sm">
                            {heroEyebrow}
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <img
                                src="/logo-fontaine.png"
                                alt="Logo Fontaine-de-Vaucluse"
                                className="h-16 w-16 rounded-[1.35rem] bg-white/10 p-2 object-contain shadow-lg sm:h-20 sm:w-20"
                            />

                            <div className="max-w-2xl">
                                <h1 className="text-3xl leading-tight text-white sm:text-5xl">{heroTitle}</h1>
                                <p className="mt-3 text-base text-[#eef7f3] sm:text-lg">{heroDescription}</p>
                            </div>
                        </div>

                        {(heroPrimaryCta || heroSecondaryCta) && (
                            <div className="flex flex-wrap gap-3">
                                {heroPrimaryCta && (
                                    <Link
                                        to={heroPrimaryCta.to}
                                        className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#163c35] transition hover:bg-[#f6f3ea]"
                                    >
                                        {heroPrimaryCta.label}
                                    </Link>
                                )}
                                {heroSecondaryCta && (
                                    <Link
                                        to={heroSecondaryCta.to}
                                        className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.16]"
                                    >
                                        {heroSecondaryCta.label}
                                    </Link>
                                )}
                            </div>
                        )}

                        {visibleQuickLinks.length > 0 && (
                            <div className="grid gap-3 sm:grid-cols-3">
                                {visibleQuickLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[0.16]"
                                    >
                                        <p className="section-kicker text-[#d7e8e1]">{link.title}</p>
                                        <p className="mt-2 text-sm text-white/[0.88]">{link.description}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {practicalHighlights.length > 0 && (
                        <aside className="grid gap-3 rounded-[1.75rem] border border-white/15 bg-[#163c35]/40 p-4 backdrop-blur-md">
                            <p className="section-kicker text-[#d7e8e1]">En un coup d'oeil</p>
                            {practicalHighlights.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3"
                                >
                                    <p className="text-sm text-[#d7e8e1]">{item.label}</p>
                                    <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                                    <p className="mt-1 text-sm text-white/[0.78]">{item.meta}</p>
                                </div>
                            ))}
                        </aside>
                    )}
                </div>
            </section>

            {visibleHomeCards.length > 0 && (
                <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {visibleHomeCards.map((card) => (
                        <Link
                            key={card.to}
                            to={card.to}
                            className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(22,60,53,0.14)]"
                        >
                            <p className="section-kicker">{card.kicker}</p>
                            <h2 className="mt-2 text-xl text-[#163c35]">{card.title}</h2>
                            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
                        </Link>
                    ))}
                </section>
            )}

            {sectionVisibility.news && featuredNews && (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">À la une</h2>
                        <Link
                            to={sectionRoutes.news}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            Voir toutes les actualités
                        </Link>
                    </div>
                    <article className="surface-card grid overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_18px_60px_rgba(22,60,53,0.08)] md:grid-cols-2">
                        <CoverImage
                            src={featuredNews.image}
                            alt={featuredNews.title}
                            className="h-56 w-full object-cover sm:h-72 md:h-full"
                        />
                        <div className="flex flex-col justify-center p-6 sm:p-8">
                            <div className="section-kicker mb-3 inline-flex w-fit rounded-full bg-[#eef7f3] px-3 py-1 text-[#1f5e54]">
                                Information utile
                            </div>
                            <p className="mb-2 text-sm text-[#5b7d76]">{formatDate(featuredNews.date)}</p>
                            <h3 className="mb-4 text-3xl text-[#163c35]">{featuredNews.title}</h3>
                            <p className="mb-6 text-sm text-slate-700 sm:text-base">
                                {featuredNews.excerpt || featuredNews.content}
                            </p>
                            <Link
                                to={`/news/${featuredNews.id}`}
                                className="font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                            >
                                Lire l'actualité →
                            </Link>
                        </div>
                    </article>
                </section>
            )}

            {sectionVisibility.parkings && parkings.length > 0 && (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">Se garer facilement</h2>
                        <Link
                            to={sectionRoutes.parkings}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            Voir tous les parkings
                        </Link>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {parkings.map((parking) => (
                            <article
                                key={parking.id}
                                className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl text-[#163c35]">{parking.name}</h3>
                                        <p className="mt-2 text-sm text-slate-600">{parking.address}</p>
                                    </div>
                                    <span className="rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                        {parking.dailyRate}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                        Véhicules
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {vehicleTypes.map((vehicle) => (
                                            <VehicleBadge
                                                key={vehicle.key}
                                                label={vehicle.label}
                                                allowed={parking[vehicle.key]}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {sectionVisibility.events && (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">Prochains événements</h2>
                        <Link
                            to={sectionRoutes.events}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
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
            )}

            {sectionVisibility.news && (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">Dernières actualités</h2>
                        <Link
                            to={sectionRoutes.news}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            Voir toutes les actualités
                        </Link>
                    </div>
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {news.map((item) => (
                            <Card key={item.id} title={item.title} date={formatDate(item.date)} image={item.image}>
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
            )}

            {sectionVisibility.hikes && (
                <section>
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">Randonnées à découvrir</h2>
                        <Link
                            to={sectionRoutes.hikes}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            Voir toutes les randonnées
                        </Link>
                    </div>
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {hikes.map((hike) => (
                            <article
                                key={hike.id}
                                className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)]"
                            >
                                <div className="mb-3 flex flex-wrap gap-2">
                                    <span className="rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                        {hike.difficulty}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                        {hike.duration}
                                    </span>
                                </div>
                                <h3 className="text-2xl text-slate-900">{hike.name}</h3>
                                <p className="mt-2 text-sm text-slate-700">{hike.description}</p>
                                <p className="mt-3 text-sm text-slate-600">Distance : {hike.distance} km</p>
                                <Link
                                    to={`/hikes/${hike.id}`}
                                    className="mt-4 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                                >
                                    Voir le détail →
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </Layout>
    );
}
