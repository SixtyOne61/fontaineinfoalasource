import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { getSectionVisibility, getSiteContent } from "../data/loader";
import { defaultSectionVisibility, sectionRoutes } from "../data/sections";
import { getLocalizedField, getLocalizedList } from "../locale";
import { useLocale } from "../useLocale";

const EMPTY_CONTENT = {
    hero: {
        eyebrow: "Guide pratique",
        eyebrowEn: "Practical guide",
        title: "Préparer une visite agréable à Fontaine-de-Vaucluse",
        titleEn: "Plan an enjoyable visit to Fontaine-de-Vaucluse",
        description:
            "Retrouvez ici les repères utiles pour arriver plus sereinement et profiter du village sans vous compliquer la journée.",
        descriptionEn:
            "Find the key information you need to arrive more easily and enjoy the village without overthinking your day."
    },
    quickLinks: [],
    highlights: [],
    guideSections: [],
    visitorTips: [],
    visitorTipsEn: [],
    alerts: [],
    alertsEn: []
};

function StepCard({ number, title, body, to, cta, secondary }) {
    return (
        <article className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6">
            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f5e54] text-sm font-semibold text-white">
                    {number}
                </div>
                <div className="min-w-0">
                    <h2 className="text-2xl text-[#163c35]">{title}</h2>
                    <p className="mt-3 text-sm text-slate-600 sm:text-base">{body}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                            to={to}
                            className="inline-flex items-center justify-center rounded-full bg-[#1f5e54] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18463e]"
                        >
                            {cta}
                        </Link>
                        {secondary}
                    </div>
                </div>
            </div>
        </article>
    );
}

function InfoPill({ children }) {
    return (
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {children}
        </div>
    );
}

export default function Guide() {
    const { lang } = useLocale();
    const [content, setContent] = useState(EMPTY_CONTENT);
    const [sectionVisibility, setSectionVisibility] = useState(defaultSectionVisibility);

    useEffect(() => {
        getSectionVisibility().then(setSectionVisibility);
        getSiteContent().then(setContent);
    }, []);

    const alerts = getLocalizedList(content, "alerts", lang).slice(0, 2);
    const visitorTips = getLocalizedList(content, "visitorTips", lang)
        .filter((tip) => !tip.toLowerCase().includes("balade"))
        .slice(0, 3);
    const visibleQuickLinks = useMemo(
        () =>
            content.quickLinks.filter((item) => {
                if (item.to === sectionRoutes.parkings) return sectionVisibility.parkings;
                if (item.to === sectionRoutes.events) return sectionVisibility.events;
                if (item.to === sectionRoutes.news) return sectionVisibility.news;
                if (item.to === sectionRoutes.photos) return sectionVisibility.photos;
                if (item.to === sectionRoutes.hikes) return sectionVisibility.hikes;
                return false;
            }),
        [content.quickLinks, sectionVisibility]
    );

    const steps = useMemo(() => {
        const items = [];

        if (sectionVisibility.parkings) {
            items.push({
                key: "parkings",
                title: lang === "en" ? "Choose your parking before arriving" : "Choisir son parking avant d'arriver",
                body:
                    lang === "en"
                        ? "This is usually the fastest way to avoid unnecessary turns and arrive more calmly."
                        : "C'est souvent le moyen le plus simple d'éviter les détours inutiles et d'arriver plus calmement.",
                to: sectionRoutes.parkings,
                cta: lang === "en" ? "Open parking page" : "Ouvrir les parkings",
                secondary: null
            });
        }

        if (sectionVisibility.events || sectionVisibility.news) {
            items.push({
                key: "today",
                title: lang === "en" ? "Check what matters today" : "Vérifier ce qui compte aujourd'hui",
                body:
                    lang === "en"
                        ? "A quick look at local updates or the agenda can save you time once you arrive."
                        : "Un coup d'œil aux infos utiles ou à l'agenda suffit souvent pour gagner du temps sur place.",
                to: sectionVisibility.news ? sectionRoutes.news : sectionRoutes.events,
                cta: sectionVisibility.news
                    ? lang === "en"
                        ? "See useful updates"
                        : "Voir les infos utiles"
                    : lang === "en"
                      ? "See events"
                      : "Voir l'agenda",
                secondary: sectionVisibility.news && sectionVisibility.events ? (
                    <Link
                        to={sectionRoutes.events}
                        className="inline-flex items-center justify-center rounded-full border border-[#a7cfc1] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f5e54] transition hover:bg-[#eef7f3]"
                    >
                        {lang === "en" ? "See events" : "Voir l'agenda"}
                    </Link>
                ) : null
            });
        }

        items.push({
            key: "on-foot",
            title: lang === "en" ? "Then continue on foot" : "Puis continuer la visite à pied",
            body:
                lang === "en"
                    ? "Once parked, the village is easier and more pleasant to discover on foot."
                    : "Une fois garé, le village se découvre plus facilement et plus agréablement à pied.",
            to: "/",
            cta: lang === "en" ? "Back to home" : "Retour à l'accueil",
            secondary: sectionVisibility.photos ? (
                <Link
                    to={sectionRoutes.photos}
                    className="inline-flex items-center justify-center rounded-full border border-[#a7cfc1] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f5e54] transition hover:bg-[#eef7f3]"
                >
                    {lang === "en" ? "See photos" : "Voir les photos"}
                </Link>
            ) : null
        });

        return items.slice(0, 3);
    }, [lang, sectionVisibility]);

    const heroTitle =
        lang === "en"
            ? "Visit Fontaine-de-Vaucluse in a few simple steps"
            : "Visiter Fontaine-de-Vaucluse en quelques étapes simples";
    const heroDescription =
        lang === "en"
            ? "This page brings together only the essentials for a short visit: arrive well, park easily and find the right information quickly."
            : "Cette page rassemble seulement l'essentiel pour une visite ponctuelle : bien arriver, se garer facilement et trouver vite la bonne information.";

    return (
        <Layout>
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/20 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_30%),linear-gradient(135deg,#18463e,#27685b_54%,#d3bc8d)] p-5 text-white shadow-[0_28px_90px_rgba(22,60,53,0.18)] sm:p-8 md:p-10">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div>
                        <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white/90">
                            {getLocalizedField(content.hero, "eyebrow", lang)}
                        </div>
                        <h1 className="mt-4 text-3xl leading-tight text-white sm:text-5xl">{heroTitle}</h1>
                        <p className="mt-4 max-w-2xl text-base text-[#eef7f3] sm:text-lg">{heroDescription}</p>
                    </div>

                    <aside className="rounded-[1.75rem] border border-white/15 bg-[#163c35]/40 p-5 backdrop-blur-md">
                        <p className="section-kicker text-[#d7e8e1]">
                            {lang === "en" ? "Keep in mind" : "À garder en tête"}
                        </p>
                        <div className="mt-4 grid gap-3">
                            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-lg font-semibold text-white">
                                    {lang === "en" ? "Check parking first" : "Regarder les parkings d'abord"}
                                </p>
                                <p className="mt-1 text-sm text-white/80">
                                    {lang === "en"
                                        ? "It usually makes the whole visit smoother."
                                        : "C'est souvent ce qui fluidifie le plus toute la visite."}
                                </p>
                            </div>
                            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-lg font-semibold text-white">
                                    {lang === "en" ? "The village is best on foot" : "Le village se découvre surtout à pied"}
                                </p>
                                <p className="mt-1 text-sm text-white/80">
                                    {lang === "en"
                                        ? "Once parked, you usually need only a short walk."
                                        : "Une fois garé, quelques minutes à pied suffisent souvent."}
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <section className="mb-8">
                <div className="mb-4">
                    <p className="section-kicker">{lang === "en" ? "Visitor path" : "Parcours visiteur"}</p>
                    <h2 className="mt-2 text-2xl text-[#163c35] sm:text-3xl">
                        {lang === "en" ? "Three simple steps" : "Trois étapes simples"}
                    </h2>
                </div>
                <div className="grid gap-5">
                    {steps.map((step, index) => (
                        <StepCard
                            key={step.key}
                            number={index + 1}
                            title={step.title}
                            body={step.body}
                            to={step.to}
                            cta={step.cta}
                            secondary={step.secondary}
                        />
                    ))}
                </div>
            </section>

            {(alerts.length > 0 || visitorTips.length > 0) && (
                <section className="mb-8 grid gap-5 lg:grid-cols-2">
                    {alerts.length > 0 && (
                        <article className="rounded-[1.75rem] border border-[#d8c08f]/60 bg-[#fff7e6] p-5 shadow-[0_14px_40px_rgba(111,86,39,0.08)] sm:p-6">
                            <p className="section-kicker text-[#8a6c22]">
                                {lang === "en" ? "Before you leave" : "Avant de partir"}
                            </p>
                            <div className="mt-4 grid gap-3">
                                {alerts.map((alert) => (
                                    <InfoPill key={alert}>{alert}</InfoPill>
                                ))}
                            </div>
                        </article>
                    )}

                    {visitorTips.length > 0 && (
                        <article className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6">
                            <p className="section-kicker">{lang === "en" ? "Useful reminders" : "Bons réflexes"}</p>
                            <div className="mt-4 grid gap-3">
                                {visitorTips.map((tip) => (
                                    <InfoPill key={tip}>{tip}</InfoPill>
                                ))}
                            </div>
                        </article>
                    )}
                </section>
            )}

            {visibleQuickLinks.length > 0 && (
                <section>
                    <article className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6">
                        <p className="section-kicker">{lang === "en" ? "Need something else?" : "Besoin d'autre chose ?"}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {visibleQuickLinks.slice(0, 3).map((item) => (
                                <Link
                                    key={item.id}
                                    to={item.to}
                                    className="inline-flex items-center justify-center rounded-full border border-[#a7cfc1] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f5e54] transition hover:bg-[#eef7f3]"
                                >
                                    {getLocalizedField(item, "title", lang)}
                                </Link>
                            ))}
                        </div>
                    </article>
                </section>
            )}
        </Layout>
    );
}
