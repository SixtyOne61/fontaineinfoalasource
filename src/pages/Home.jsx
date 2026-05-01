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
    getPhotoGroups,
    getSectionVisibility,
    getSiteContent
} from "../data/loader";
import { defaultSectionVisibility, sectionRoutes } from "../data/sections";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";
import { compareEventsByStartDate, getEventEndDate, getEventStartDate, getRecurrenceLabel, parseLocalDate } from "../utils/events";

const quickLinks = [
    { key: "guide", titleFr: "Guide pratique", titleEn: "Practical guide", descriptionFr: "Les reperes utiles avant d'arriver.", descriptionEn: "Helpful information before you arrive.", to: sectionRoutes.guide },
    { key: "parkings", titleFr: "Se garer", titleEn: "Parking", descriptionFr: "Trouver un parking adapte a votre vehicule.", descriptionEn: "Find parking that suits your vehicle.", to: sectionRoutes.parkings },
    { key: "events", titleFr: "Que faire aujourd'hui", titleEn: "What to do today", descriptionFr: "Voir les sorties et animations du moment.", descriptionEn: "See what is happening today.", to: sectionRoutes.events },
    { key: "hikes", titleFr: "Choisir une balade", titleEn: "Choose a walk", descriptionFr: "Reperer un parcours selon votre temps.", descriptionEn: "Pick a route based on your time.", to: sectionRoutes.hikes },
    { key: "photos", titleFr: "Fontaine en photo", titleEn: "Fontaine in photos", descriptionFr: "Parcourir des groupes de photos et leurs textes associes.", descriptionEn: "Browse themed photo groups with their related text.", to: sectionRoutes.photos }
];

const homeCards = [
    { key: "guide", to: sectionRoutes.guide, kickerFr: "A savoir", kickerEn: "Good to know", titleFr: "Preparer ma visite", titleEn: "Plan my visit", descriptionFr: "Retrouvez les infos essentielles pour arriver plus sereinement.", descriptionEn: "Find the key information you need for a smoother arrival." },
    { key: "parkings", to: sectionRoutes.parkings, kickerFr: "Acces", kickerEn: "Access", titleFr: "Voir les parkings", titleEn: "See parking", descriptionFr: "Comparez les acces, les tarifs et les vehicules acceptes avant d'entrer dans le village.", descriptionEn: "Compare access, rates and allowed vehicles before entering the village." },
    { key: "events", to: sectionRoutes.events, kickerFr: "Sorties", kickerEn: "Outings", titleFr: "Decouvrir l'agenda", titleEn: "See events", descriptionFr: "Reperez en un coup d'oeil les rendez-vous du jour et de la semaine.", descriptionEn: "Quickly spot what's happening today and this week." },
    { key: "hikes", to: sectionRoutes.hikes, kickerFr: "Nature", kickerEn: "Nature", titleFr: "Explorer les balades", titleEn: "Browse walks", descriptionFr: "Choisissez un parcours selon la difficulte, la duree et le point de depart.", descriptionEn: "Choose a route by difficulty, duration and starting point." },
    { key: "photos", to: sectionRoutes.photos, kickerFr: "Galerie", kickerEn: "Gallery", titleFr: "Voir Fontaine en photo", titleEn: "See Fontaine in photos", descriptionFr: "Decouvrez des groupes de photos mis en contexte par un texte associe.", descriptionEn: "Discover themed photo groups introduced by a related text." },
    { key: "news", to: sectionRoutes.news, kickerFr: "Infos utiles", kickerEn: "Useful updates", titleFr: "Voir les infos du moment", titleEn: "Read updates", descriptionFr: "Gardez un oeil sur les messages utiles pour preparer votre venue.", descriptionEn: "Keep an eye on practical local updates before you come." }
];

const vehicleTypes = {
    fr: [
        { key: "motorcycles", label: "Moto" },
        { key: "cars", label: "Voiture" },
        { key: "minivans", label: "Mini-van" },
        { key: "campers", label: "Camping-car" }
    ],
    en: [
        { key: "motorcycles", label: "Motorbike" },
        { key: "cars", label: "Car" },
        { key: "minivans", label: "Minivan" },
        { key: "campers", label: "Motorhome" }
    ]
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
    const [photoGroups, setPhotoGroups] = useState([]);
    const [sectionVisibility, setSectionVisibility] = useState(defaultSectionVisibility);
    const [siteContent, setSiteContent] = useState(null);

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(locale, {
                day: "numeric",
                month: "long"
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

        getPhotoGroups().then((data) => {
            setPhotoGroups(data.slice(0, 2));
        });
    }, []);

    const visibleQuickLinks = useMemo(
        () =>
            (
                siteContent?.quickLinks?.length
                    ? siteContent.quickLinks.map((link) => ({
                          ...link,
                          key: link.to === sectionRoutes.parkings ? "parkings" : link.to === sectionRoutes.photos ? "photos" : link.id
                      }))
                    : quickLinks
            ).filter((link) => sectionVisibility[link.key]),
        [sectionVisibility, siteContent]
    );

    const visibleHomeCards = useMemo(
        () =>
            (
                siteContent?.quickLinks?.length
                    ? siteContent.quickLinks.map((link) => ({
                          key: link.to === sectionRoutes.parkings ? "parkings" : link.to === sectionRoutes.photos ? "photos" : link.id,
                          to: link.to,
                          kicker: getLocalizedField(link, "badge", lang) || (lang === "en" ? "Quick access" : "Acces rapide"),
                          title: getLocalizedField(link, "title", lang),
                          description: getLocalizedField(link, "description", lang)
                      }))
                    : homeCards.map((card) => ({
                          ...card,
                          kicker: lang === "en" ? card.kickerEn : card.kickerFr,
                          title: lang === "en" ? card.titleEn : card.titleFr,
                          description: lang === "en" ? card.descriptionEn : card.descriptionFr
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
            meta: getLocalizedField(item, "description", lang)
        })),
        sectionVisibility.parkings
            ? {
                  label: lang === "en" ? "Parking options" : "Parkings reperes",
                  value: parkings.length > 0 ? `${parkings.length} ${lang === "en" ? "options" : "options"}` : lang === "en" ? "To review" : "A verifier",
                  meta: lang === "en" ? "Helpful before entering the village centre" : "Utile avant d'entrer dans le coeur du village"
              }
            : null,
        sectionVisibility.events
            ? {
                  label: lang === "en" ? "Next event" : "Prochain rendez-vous",
                  value: nextEvent ? getLocalizedField(nextEvent, "title", lang) : lang === "en" ? "Nothing planned yet" : "Rien de prevu pour l'instant",
                  meta: nextEvent ? formatEventDate(nextEvent) : lang === "en" ? "Take a look at the agenda" : "Un coup d'oeil a l'agenda"
              }
            : null,
        sectionVisibility.hikes
            ? {
                  label: lang === "en" ? "Easy walks" : "Balades faciles",
                  value: easyHikeCount > 0 ? `${easyHikeCount} ${lang === "en" ? "routes" : "parcours"}` : lang === "en" ? "To enrich" : "A enrichir",
                  meta: lang === "en" ? "Perfect for a short visit or a family outing" : "Ideal pour une visite courte ou une sortie en famille"
              }
            : null,
        sectionVisibility.photos
            ? {
                  label: lang === "en" ? "Photo groups" : "Groupes photo",
                  value: photoGroups.length > 0 ? `${photoGroups.length} ${lang === "en" ? "themes" : "themes"}` : lang === "en" ? "To add" : "A ajouter",
                  meta: lang === "en" ? "Visual highlights to explore at a glance" : "Des ambiances visuelles a parcourir en un coup d'oeil"
              }
            : null
    ]
        .filter(Boolean)
        .slice(0, 4);

    const heroTitle = getLocalizedField(siteContent?.hero, "title", lang) || "Fontaine Info a la Source";
    const heroDescription =
        getLocalizedField(siteContent?.hero, "description", lang) ||
        (lang === "en"
            ? "Useful information to enjoy Fontaine-de-Vaucluse more easily: parking, events, walks, photo galleries and local updates."
            : "Les infos utiles pour profiter plus facilement de Fontaine-de-Vaucluse : stationnement, evenements, balades, photos et conseils pratiques.");
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

            {sectionVisibility.photos && photoGroups.length > 0 && (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">
                            {lang === "en" ? "Fontaine in photos" : "Fontaine en photo"}
                        </h2>
                        <Link
                            to={sectionRoutes.photos}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            {lang === "en" ? "See the full gallery" : "Voir toute la galerie"}
                        </Link>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                        {photoGroups.map((group) => (
                            <article
                                key={group.id}
                                className="surface-card overflow-hidden rounded-[1.85rem] border border-white/70 shadow-[0_18px_60px_rgba(22,60,53,0.08)]"
                            >
                                <div className="grid gap-1 sm:grid-cols-2">
                                    {group.photos.slice(0, 4).map((photo) => (
                                        <CoverImage
                                            key={photo.id}
                                            src={photo.image}
                                            alt={getLocalizedField(photo, "alt", lang) || getLocalizedField(group, "title", lang)}
                                            className="h-40 w-full object-cover sm:h-48"
                                            fallbackText={lang === "en" ? "Image unavailable" : "Image indisponible"}
                                        />
                                    ))}
                                </div>
                                <div className="p-5 sm:p-6">
                                    <p className="section-kicker">{lang === "en" ? "Photo group" : "Groupe photo"}</p>
                                    <h3 className="mt-2 text-2xl text-[#163c35]">{getLocalizedField(group, "title", lang)}</h3>
                                    <p className="mt-3 text-sm text-slate-600">
                                        {getLocalizedField(group, "description", lang)}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {sectionVisibility.news && featuredNews && (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">{lang === "en" ? "Top update" : "A la une"}</h2>
                        <Link
                            to={sectionRoutes.news}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            {lang === "en" ? "See all updates" : "Voir toutes les infos"}
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
                                {lang === "en" ? "Good to know" : "Bon a savoir"}
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
                                {lang === "en" ? "Read the update ->" : "Lire l'info ->"}
                            </Link>
                        </div>
                    </article>
                </section>
            )}

            {sectionVisibility.parkings && parkings.length > 0 && (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">{lang === "en" ? "Parking made easier" : "Se garer plus facilement"}</h2>
                        <Link
                            to={sectionRoutes.parkings}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            {lang === "en" ? "See all parking" : "Voir tous les parkings"}
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
                                        {lang === "en" ? "Suitable for" : "Convient pour"}
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
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">{lang === "en" ? "Coming up soon" : "A venir bientot"}</h2>
                        <Link
                            to={sectionRoutes.events}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            {lang === "en" ? "See all events" : "Voir tous les evenements"}
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
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">{lang === "en" ? "Latest updates" : "Les dernieres infos"}</h2>
                        <Link
                            to={sectionRoutes.news}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            {lang === "en" ? "See all updates" : "Voir toutes les infos"}
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
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">{lang === "en" ? "Walks to discover" : "Balades a decouvrir"}</h2>
                        <Link
                            to={sectionRoutes.hikes}
                            className="text-sm font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                        >
                            {lang === "en" ? "See all walks" : "Voir toutes les balades"}
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
