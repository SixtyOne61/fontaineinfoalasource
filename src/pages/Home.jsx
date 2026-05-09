import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import {
    getEvents,
    getNews,
    getParkings,
    getPhotoGroups,
    getSectionVisibility,
    getSiteContent
} from "../data/loader";
import { defaultSectionVisibility, sectionRoutes } from "../data/sections";
import { getLocalizedField, getLocalizedList } from "../locale";
import { useLocale } from "../useLocale";
import { compareEventsByStartDate, getEventEndDate, getEventStartDate, parseLocalDate } from "../utils/events";

const fallbackQuickLinks = [
    {
        key: "guide",
        titleFr: "Preparer ma visite",
        titleEn: "Plan my visit",
        descriptionFr: "Les reperes utiles avant d'arriver.",
        descriptionEn: "Helpful information before you arrive.",
        to: sectionRoutes.guide
    },
    {
        key: "parkings",
        titleFr: "Trouver un parking",
        titleEn: "Find parking",
        descriptionFr: "Choisir rapidement ou se garer selon votre vehicule.",
        descriptionEn: "Quickly choose where to park based on your vehicle.",
        to: sectionRoutes.parkings
    },
    {
        key: "events",
        titleFr: "Que faire aujourd'hui",
        titleEn: "What to do today",
        descriptionFr: "Voir les sorties et animations du moment.",
        descriptionEn: "See what is happening today.",
        to: sectionRoutes.events
    },
    {
        key: "hikes",
        titleFr: "Choisir une balade",
        titleEn: "Choose a walk",
        descriptionFr: "Trouver un parcours selon votre temps.",
        descriptionEn: "Pick a route based on your time.",
        to: sectionRoutes.hikes
    }
];

const sectionPriority = ["guide", "parkings", "events", "hikes", "news", "photos"];

function ActionCard({ to, eyebrow, title, description }) {
    return (
        <Link
            to={to}
            className="surface-card rounded-[1.6rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(22,60,53,0.14)]"
        >
            <p className="section-kicker">{eyebrow}</p>
            <h2 className="mt-2 text-xl text-[#163c35] sm:text-2xl">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">{description}</p>
        </Link>
    );
}

export default function Home() {
    const { lang, locale } = useLocale();
    const [featuredNews, setFeaturedNews] = useState(null);
    const [events, setEvents] = useState([]);
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

    useEffect(() => {
        getSectionVisibility().then(setSectionVisibility);
        getSiteContent().then(setSiteContent);

        getNews().then((data) => {
            const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
            setFeaturedNews(sorted[0] || null);
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

        getParkings().then(setParkings);
        getPhotoGroups().then(setPhotoGroups);
    }, []);

    const quickActions = useMemo(() => {
        const configuredLinks = siteContent?.quickLinks?.length
            ? siteContent.quickLinks.map((link) => ({
                  ...link,
                  key:
                      link.to === sectionRoutes.parkings
                          ? "parkings"
                          : link.to === sectionRoutes.photos
                            ? "photos"
                            : link.id
              }))
            : fallbackQuickLinks.map((link) => ({
                  ...link,
                  title: lang === "en" ? link.titleEn : link.titleFr,
                  description: lang === "en" ? link.descriptionEn : link.descriptionFr
              }));

        return configuredLinks
            .filter((link) => sectionVisibility[link.key])
            .sort((a, b) => sectionPriority.indexOf(a.key) - sectionPriority.indexOf(b.key))
            .slice(0, 4)
            .map((link, index) => ({
                key: link.key,
                to: link.to,
                eyebrow: lang === "en" ? `Step ${index + 1}` : `Etape ${index + 1}`,
                title: getLocalizedField(link, "title", lang) || link.title,
                description: getLocalizedField(link, "description", lang) || link.description
            }));
    }, [lang, sectionVisibility, siteContent]);

    const nextEvent = events[0] || null;
    const visitorTips = getLocalizedList(siteContent, "visitorTips", lang).slice(0, 3);
    const alerts = getLocalizedList(siteContent, "alerts", lang).slice(0, 2);

    const heroTitle = getLocalizedField(siteContent?.hero, "title", lang) || "Fontaine Info a la Source";
    const heroDescription =
        getLocalizedField(siteContent?.hero, "description", lang) ||
        (lang === "en"
            ? "Useful information to visit Fontaine-de-Vaucluse quickly and calmly."
            : "Les infos utiles pour visiter Fontaine-de-Vaucluse rapidement et sereinement.");
    const heroEyebrow =
        getLocalizedField(siteContent?.hero, "eyebrow", lang) ||
        (lang === "en" ? "Visitor guide" : "Guide visiteur");
    const hasVisitorInfo = alerts.length > 0 || visitorTips.length > 0;

    return (
        <Layout>
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/20 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_30%),linear-gradient(135deg,#18463e,#27685b_54%,#d3bc8d)] p-5 text-white shadow-[0_28px_90px_rgba(22,60,53,0.18)] sm:mb-10 sm:p-8 md:p-10">
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                    <div>
                        <div className="inline-flex rounded-full border border-white/15 bg-white/[0.12] px-3 py-1 text-sm font-medium text-white/90 backdrop-blur-sm">
                            {heroEyebrow}
                        </div>
                        <h1 className="mt-4 max-w-3xl text-3xl leading-tight text-white sm:text-5xl">{heroTitle}</h1>
                        <p className="mt-4 max-w-2xl text-base text-[#eef7f3] sm:text-lg">{heroDescription}</p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {sectionVisibility.parkings ? (
                                <Link
                                    to={sectionRoutes.parkings}
                                    className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#163c35] transition hover:bg-[#f6f3ea]"
                                >
                                    {lang === "en" ? "See parking" : "Voir les parkings"}
                                </Link>
                            ) : null}
                            {sectionVisibility.guide ? (
                                <Link
                                    to={sectionRoutes.guide}
                                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.16]"
                                >
                                    {lang === "en" ? "Plan my visit" : "Preparer ma visite"}
                                </Link>
                            ) : null}
                            {sectionVisibility.events ? (
                                <Link
                                    to={sectionRoutes.events}
                                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.16]"
                                >
                                    {lang === "en" ? "What to do today" : "Que faire aujourd'hui"}
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    <aside className="rounded-[1.75rem] border border-white/15 bg-[#163c35]/40 p-5 backdrop-blur-md">
                        <p className="section-kicker text-[#d7e8e1]">
                            {lang === "en" ? "Useful right now" : "Utile maintenant"}
                        </p>
                        <div className="mt-4 grid gap-3">
                            {sectionVisibility.parkings ? (
                                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                                    <p className="text-sm text-[#d7e8e1]">{lang === "en" ? "Parking" : "Stationnement"}</p>
                                    <p className="mt-1 text-lg font-semibold text-white">
                                        {parkings.length > 0
                                            ? `${parkings.length} ${lang === "en" ? "options listed" : "options reperees"}`
                                            : lang === "en"
                                              ? "Check the parking page"
                                              : "Consulter la page parkings"}
                                    </p>
                                </div>
                            ) : null}
                            {sectionVisibility.events ? (
                                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                                    <p className="text-sm text-[#d7e8e1]">{lang === "en" ? "Next event" : "Prochain rendez-vous"}</p>
                                    <p className="mt-1 text-lg font-semibold text-white">
                                        {nextEvent
                                            ? getLocalizedField(nextEvent, "title", lang)
                                            : lang === "en"
                                              ? "Nothing scheduled yet"
                                              : "Rien de prevu pour l'instant"}
                                    </p>
                                    {nextEvent ? (
                                        <p className="mt-1 text-sm text-white/80">{formatEventDate(nextEvent)}</p>
                                    ) : null}
                                </div>
                            ) : null}
                            {sectionVisibility.news && featuredNews ? (
                                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                                    <p className="text-sm text-[#d7e8e1]">{lang === "en" ? "Latest update" : "Info recente"}</p>
                                    <p className="mt-1 text-lg font-semibold text-white">
                                        {getLocalizedField(featuredNews, "title", lang)}
                                    </p>
                                    <p className="mt-1 text-sm text-white/80">{formatDate(featuredNews.date)}</p>
                                </div>
                            ) : null}
                        </div>
                    </aside>
                </div>
            </section>

            {quickActions.length > 0 ? (
                <section className="mb-10 sm:mb-12">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="section-kicker">{lang === "en" ? "Fast access" : "Acces rapide"}</p>
                            <h2 className="mt-2 text-2xl text-[#163c35] sm:text-3xl">
                                {lang === "en" ? "Find the right information in two clicks" : "Trouver la bonne info en deux clics"}
                            </h2>
                        </div>
                        <p className="max-w-xl text-sm text-slate-600 sm:text-right sm:text-base">
                            {lang === "en"
                                ? "The most useful actions for a short visit are grouped here."
                                : "Les actions les plus utiles pour une visite ponctuelle sont regroupees ici."}
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {quickActions.map((action) => (
                            <ActionCard
                                key={action.to}
                                to={action.to}
                                eyebrow={action.eyebrow}
                                title={action.title}
                                description={action.description}
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            {hasVisitorInfo ? (
                <section className="mb-10 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                    {alerts.length > 0 ? (
                        <article className="rounded-[1.6rem] border border-[#d8c08f]/60 bg-[#fff8e8] p-5 shadow-[0_18px_60px_rgba(149,122,52,0.10)]">
                            <p className="section-kicker text-[#8a6c22]">{lang === "en" ? "Before you arrive" : "Avant de venir"}</p>
                            <div className="mt-3 grid gap-3">
                                {alerts.map((alert) => (
                                    <p key={alert} className="text-sm text-[#5f512a] sm:text-base">
                                        {alert}
                                    </p>
                                ))}
                            </div>
                        </article>
                    ) : null}
                    {visitorTips.length > 0 ? (
                        <article className="surface-card rounded-[1.6rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                            <p className="section-kicker">{lang === "en" ? "Simple tips" : "Bons reflexes"}</p>
                            <div className="mt-3 grid gap-3">
                                {visitorTips.map((tip) => (
                                    <p key={tip} className="text-sm text-slate-700 sm:text-base">
                                        {tip}
                                    </p>
                                ))}
                            </div>
                        </article>
                    ) : null}
                </section>
            ) : null}

            {sectionVisibility.photos && photoGroups.length > 0 ? (
                <section className="rounded-[1.75rem] border border-dashed border-[#c8d8d1] bg-white/40 px-5 py-6 text-center">
                    <p className="section-kicker">{lang === "en" ? "Optional" : "En plus"}</p>
                    <h2 className="mt-2 text-2xl text-[#163c35]">
                        {lang === "en" ? "Explore Fontaine in photos" : "Explorer Fontaine en photo"}
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                        {lang === "en"
                            ? "The photo galleries remain available if you want a more visual discovery of the village."
                            : "Les galeries photo restent disponibles si vous souhaitez une decouverte plus visuelle du village."}
                    </p>
                    <Link
                        to={sectionRoutes.photos}
                        className="mt-4 inline-block font-medium text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                    >
                        {lang === "en" ? "Open photo galleries ->" : "Ouvrir les galeries photo ->"}
                    </Link>
                </section>
            ) : null}
        </Layout>
    );
}
