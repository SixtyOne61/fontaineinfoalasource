import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import CoverImage from "../components/CoverImage";
import Layout from "../components/Layout";
import {
    getEvents,
    getHikes,
    getNews,
    getParkings,
    getSectionVisibility,
    getSiteContent,
} from "../data/loader";
import { defaultSectionVisibility, sectionRoutes } from "../data/sections";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";
import { compareEventsByStartDate, getEventEndDate, getEventStartDate, getRecurrenceLabel, parseLocalDate } from "../utils/events";

const quickLinks = [
    { key: "guide", titleFr: "Guide pratique", titleEn: "Practical guide", descriptionFr: "Voir les repères utiles avant d'arriver.", descriptionEn: "Check key information before arriving.", to: sectionRoutes.guide },
    { key: "parkings", titleFr: "Se garer", titleEn: "Parking", descriptionFr: "Trouver un parking adapté à votre véhicule.", descriptionEn: "Find parking for your vehicle.", to: sectionRoutes.parkings },
    { key: "events", titleFr: "Que faire aujourd'hui", titleEn: "What to do today", descriptionFr: "Voir les animations et sorties proches.", descriptionEn: "See current events and activities.", to: sectionRoutes.events },
    { key: "hikes", titleFr: "Choisir une balade", titleEn: "Choose a hike", descriptionFr: "Comparer les randonnées selon votre temps.", descriptionEn: "Compare hikes based on your available time.", to: sectionRoutes.hikes },
];

const homeCards = [
    { key: "guide", to: sectionRoutes.guide, kickerFr: "Essentiel", kickerEn: "Essential", titleFr: "Consulter le guide", titleEn: "Open the guide", descriptionFr: "Retrouvez les informations clés pour préparer votre visite depuis votre téléphone.", descriptionEn: "Find the key information to prepare your visit on mobile." },
    { key: "parkings", to: sectionRoutes.parkings, kickerFr: "Accès rapide", kickerEn: "Quick access", titleFr: "Trouver un parking", titleEn: "Find parking", descriptionFr: "Comparer les accès, les tarifs et les véhicules acceptés avant d'entrer dans le village.", descriptionEn: "Compare access, rates and allowed vehicles before entering the village." },
    { key: "events", to: sectionRoutes.events, kickerFr: "Agenda", kickerEn: "Agenda", titleFr: "Voir les événements", titleEn: "See events", descriptionFr: "Repérer les rendez-vous utiles aujourd'hui, cette semaine ou plus tard.", descriptionEn: "Check what's happening today, this week or later." },
    { key: "hikes", to: sectionRoutes.hikes, kickerFr: "Nature", kickerEn: "Nature", titleFr: "Choisir une balade", titleEn: "Choose a hike", descriptionFr: "Sélectionner un parcours selon la difficulté, la durée et le point de départ.", descriptionEn: "Pick a route by difficulty, duration and starting point." },
    { key: "news", to: sectionRoutes.news, kickerFr: "Infos pratiques", kickerEn: "Practical info", titleFr: "Consulter les actus", titleEn: "Read news", descriptionFr: "Suivre les messages utiles pour les visiteurs et les habitants.", descriptionEn: "Follow useful updates for visitors and residents." },
];

const vehicleTypes = {
    fr: [
        { key: "motorcycles", label: "Moto" },
        { key: "cars", label: "Voiture" },
        { key: "minivans", label: "Mini-van" },
        { key: "campers", label: "Camping-car" },
    ],
    en: [
        { key: "motorcycles", label: "Motorbike" },
        { key: "cars", label: "Car" },
        { key: "minivans", label: "Minivan" },
        { key: "campers", label: "Motorhome" },
    ],
};

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
    const { lang, locale, t } = useLocale();
    const [featuredNews, setFeaturedNews] = useState(null);
    const [news, setNews] = useState([]);
    const [events, setEvents] = useState([]);
    const [hikes, setHikes] = useState([]);
    const [parkings, setParkings] = useState([]);
    const [sectionVisibility, setSectionVisibility] = useState(defaultSectionVisibility);
    const [siteContent, setSiteContent] = useState(null);

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(locale, {
                day: "numeric",
                month: "long",
            }),
        [locale]
    );

    function formatDate(value) {
        const date = parseLocalDate(value);
        return date ? dateFormatter.format(date) : value || "";
    }

    function formatEventDate(event) {
        const start = getEventStartDate(event);
        const end = getEventEndDate(event);

        if (!start) return "";
        if (!end || start === end) return formatDate(start);

        return lang === "en"
            ? `From ${formatDate(start)} to ${formatDate(end)}`
            : `Du ${formatDate(start)} au ${formatDate(end)}`;
    }

    function getEventStatus(startDate, endDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = parseLocalDate(startDate);
        if (!start) {
            return t("common.upcoming");
        }

        const end = parseLocalDate(endDate || startDate) || start;
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((start - today) / (1000 * 60 * 60 * 24));

        if (today >= start && today <= end) return t("common.inProgress");
        if (diffDays === 0) return t("common.today");
        if (diffDays > 0 && diffDays <= 6) return t("common.thisWeek");
        return t("common.upcoming");
    }

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
            today.setHours(0, 0, 0, 0);
            const upcoming = data
                .filter((event) => {
                    const end = parseLocalDate(getEventEndDate(event));
                    return end && end >= today;
                })
                .sort(compareEventsByStartDate);

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
                          kicker: getLocalizedField(link, "badge", lang) || (lang === "en" ? "Quick access" : "Accès rapide"),
                          title: getLocalizedField(link, "title", lang),
                          description: getLocalizedField(link, "description", lang),
                      }))
                    : homeCards.map((card) => ({
                          ...card,
                          kicker: lang === "en" ? card.kickerEn : card.kickerFr,
                          title: lang === "en" ? card.titleEn : card.titleFr,
                          description: lang === "en" ? card.descriptionEn : card.descriptionFr,
                      }))
            ).filter((card) => sectionVisibility[card.key]),
        [lang, sectionVisibility, siteContent]
    );

    const nextEvent = events[0];
    const easyHikeCount = hikes.filter((hike) => getLocalizedField(hike, "difficulty", "fr") === "Facile").length;
    const practicalHighlights = [
            ...(siteContent?.highlights ?? []).map((item) => ({
                label: getLocalizedField(item, "title", lang),
                value: getLocalizedField(item, "value", lang),
                meta: getLocalizedField(item, "description", lang),
            })),
            sectionVisibility.parkings
                ? {
                      label: lang === "en" ? "Parking options" : "Parkings repérés",
                      value: parkings.length > 0 ? `${parkings.length} ${lang === "en" ? "options" : "options"}` : lang === "en" ? "To review" : "À vérifier",
                      meta: lang === "en" ? "Useful spaces before entering the village centre" : "Places utiles avant d'entrer au coeur du village",
                  }
                : null,
            sectionVisibility.events
                ? {
                      label: lang === "en" ? "Next event" : "Prochain événement",
                      value: nextEvent ? getLocalizedField(nextEvent, "title", lang) : lang === "en" ? "Nothing scheduled" : "Aucun programmé",
                      meta: nextEvent ? formatEventDate(nextEvent) : lang === "en" ? "Check the agenda" : "Agenda à consulter",
                  }
                : null,
            sectionVisibility.hikes
                ? {
                      label: lang === "en" ? "Easy hikes" : "Balades faciles",
                      value: easyHikeCount > 0 ? `${easyHikeCount} ${lang === "en" ? "routes" : "parcours"}` : lang === "en" ? "To enrich" : "À enrichir",
                      meta: lang === "en" ? "Ideal for a short or family outing" : "Idéal pour une sortie courte ou familiale",
                  }
                : null,
        ]
            .filter(Boolean)
            .slice(0, 4);

    const heroTitle = getLocalizedField(siteContent?.hero, "title", lang) || "Fontaine Info à la Source";
    const heroDescription =
        getLocalizedField(siteContent?.hero, "description", lang) ||
        (lang === "en"
            ? "Useful information to quickly find your way around Fontaine-de-Vaucluse: parking, events, hikes and local updates."
            : "Les informations utiles pour se repérer rapidement à Fontaine-de-Vaucluse : stationnement, événements, randonnées et actus de terrain.");
    const heroEyebrow =
        getLocalizedField(siteContent?.hero, "eyebrow", lang) ||
        (lang === "en" ? "Visitors and residents guide" : "Guide pratique visiteurs et habitants");
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
                                        {getLocalizedField(heroPrimaryCta, "label", lang)}
                                    </Link>
                                )}
                                {heroSecondaryCta && (
                                    <Link
                                        to={heroSecondaryCta.to}
                                        className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.16]"
                                    >
                                        {getLocalizedField(heroSecondaryCta, "label", lang)}
                                    </Link>
                                )}
                            </div>
                        )}

                        {visibleQuickLinks.length > 0 && (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {visibleQuickLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="rounded-[1.5rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[0.16]"
                                    >
                                        <p className="section-kicker text-[#d7e8e1]">
                                            {getLocalizedField(link, "title", lang) || (lang === "en" ? link.titleEn : link.titleFr)}
                                        </p>
                                        <p className="mt-2 text-sm text-white/[0.88]">
                                            {getLocalizedField(link, "description", lang) || (lang === "en" ? link.descriptionEn : link.descriptionFr)}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {practicalHighlights.length > 0 && (
                        <aside className="grid gap-3 rounded-[1.75rem] border border-white/15 bg-[#163c35]/40 p-4 backdrop-blur-md">
                            <p className="section-kicker text-[#d7e8e1]">
                                {lang === "en" ? "At a glance" : "En un coup d'oeil"}
                            </p>
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
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">{lang === "en" ? "Top story" : "À la une"}</h2>
                        <Link
                            to={sectionRoutes.news}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            {lang === "en" ? "View all news" : "Voir toutes les actualités"}
                        </Link>
                    </div>
                    <article className="surface-card grid overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_18px_60px_rgba(22,60,53,0.08)] md:grid-cols-2">
                        <CoverImage
                            src={featuredNews.image}
                            alt={getLocalizedField(featuredNews, "title", lang)}
                            className="h-56 w-full object-cover sm:h-72 md:h-full"
                        />
                        <div className="flex flex-col justify-center p-6 sm:p-8">
                            <div className="section-kicker mb-3 inline-flex w-fit rounded-full bg-[#eef7f3] px-3 py-1 text-[#1f5e54]">
                                {lang === "en" ? "Useful update" : "Information utile"}
                            </div>
                            <p className="mb-2 text-sm text-[#5b7d76]">{formatDate(featuredNews.date)}</p>
                            <h3 className="mb-4 text-3xl text-[#163c35]">{getLocalizedField(featuredNews, "title", lang)}</h3>
                            <p className="mb-6 text-sm text-slate-700 sm:text-base">
                                {getLocalizedField(featuredNews, "excerpt", lang) || getLocalizedField(featuredNews, "content", lang)}
                            </p>
                            <Link
                                to={`/news/${featuredNews.id}`}
                                className="font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                            >
                                {lang === "en" ? "Read the update →" : "Lire l'actualité →"}
                            </Link>
                        </div>
                    </article>
                </section>
            )}

            {sectionVisibility.parkings && parkings.length > 0 && (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">{lang === "en" ? "Park with ease" : "Se garer facilement"}</h2>
                        <Link
                            to={sectionRoutes.parkings}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            {lang === "en" ? "View all parking" : "Voir tous les parkings"}
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
                                        <h3 className="text-2xl text-[#163c35]">{getLocalizedField(parking, "name", lang)}</h3>
                                        <p className="mt-2 text-sm text-slate-600">{getLocalizedField(parking, "address", lang)}</p>
                                    </div>
                                    <span className="rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                        {getLocalizedField(parking, "dailyRate", lang)}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                        {lang === "en" ? "Vehicles" : "Véhicules"}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {vehicleTypes[lang].map((vehicle) => (
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
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">{lang === "en" ? "Upcoming events" : "Prochains événements"}</h2>
                        <Link
                            to={sectionRoutes.events}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            {lang === "en" ? "View all events" : "Voir tous les événements"}
                        </Link>
                    </div>
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {events.map((event) => (
                            <Card key={event.id} title={getLocalizedField(event, "title", lang)} date={formatEventDate(event)} image={event.image}>
                                <div className="mb-3 inline-flex rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                    {getEventStatus(getEventStartDate(event), getEventEndDate(event))}
                                </div>
                                <p className="text-sm text-slate-700">{getLocalizedField(event, "location", lang)}</p>
                                {event.recurrence && (
                                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-[#5b7d76]">
                                        {getRecurrenceLabel(event, lang)}
                                    </p>
                                )}
                                <Link
                                    to={`/events/${event.id}`}
                                    className="mt-3 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                                >
                                    {t("common.viewDetails")}
                                </Link>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {sectionVisibility.news && (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">{lang === "en" ? "Latest news" : "Dernières actualités"}</h2>
                        <Link
                            to={sectionRoutes.news}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            {lang === "en" ? "View all news" : "Voir toutes les actualités"}
                        </Link>
                    </div>
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {news.map((item) => (
                            <Card key={item.id} title={getLocalizedField(item, "title", lang)} date={formatDate(item.date)} image={item.image}>
                                <p className="text-sm text-slate-700">{getLocalizedField(item, "excerpt", lang)}</p>
                                <Link
                                    to={`/news/${item.id}`}
                                    className="mt-3 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                                >
                                    {t("common.readMore")}
                                </Link>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {sectionVisibility.hikes && (
                <section>
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">{lang === "en" ? "Hikes to discover" : "Randonnées à découvrir"}</h2>
                        <Link
                            to={sectionRoutes.hikes}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            {lang === "en" ? "View all hikes" : "Voir toutes les randonnées"}
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
                                        {getLocalizedField(hike, "difficulty", lang)}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                        {getLocalizedField(hike, "duration", lang)}
                                    </span>
                                </div>
                                <h3 className="text-2xl text-slate-900">{getLocalizedField(hike, "name", lang)}</h3>
                                <p className="mt-2 text-sm text-slate-700">{getLocalizedField(hike, "description", lang)}</p>
                                <p className="mt-3 text-sm text-slate-600">
                                    {lang === "en" ? "Distance:" : "Distance :"} {hike.distance} km
                                </p>
                                <Link
                                    to={`/hikes/${hike.id}`}
                                    className="mt-4 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                                >
                                    {t("common.viewDetails")}
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </Layout>
    );
}
