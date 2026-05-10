import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AsyncStateCard from "../components/AsyncStateCard";
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
        description: "Retrouvez ici les repères utiles pour arriver plus sereinement et profiter du village sans vous compliquer la journée.",
        descriptionEn: "Find the key information you need to arrive more easily and enjoy the village without overthinking your day.",
        primaryCta: null,
        secondaryCta: null,
    },
    quickLinks: [],
    guideSections: [],
    contacts: [],
    visitorTips: [],
    visitorTipsEn: [],
    alerts: [],
    alertsEn: [],
};

function getSectionKeyFromRoute(route) {
    if (route === sectionRoutes.parkings) return "parkings";
    if (route === sectionRoutes.guide) return "guide";
    if (route === sectionRoutes.events) return "events";
    if (route === sectionRoutes.hikes) return "hikes";
    if (route === sectionRoutes.news) return "news";
    if (route === sectionRoutes.photos) return "photos";
    return null;
}

function InfoPill({ children }) {
    return (
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {children}
        </div>
    );
}

function SectionCard({ number, title, summary, items, links, lang }) {
    return (
        <article className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6">
            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f5e54] text-sm font-semibold text-white">
                    {number}
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl text-[#163c35]">{title}</h2>
                    {summary ? <p className="mt-3 text-sm text-slate-600 sm:text-base">{summary}</p> : null}

                    {items.length > 0 ? (
                        <div className="mt-5 grid gap-3">
                            {items.map((item) => (
                                <div key={item.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                                    <h3 className="text-base font-semibold text-slate-900">{getLocalizedField(item, "title", lang)}</h3>
                                    {getLocalizedField(item, "description", lang) ? (
                                        <p className="mt-2 text-sm text-slate-600 sm:text-base">
                                            {getLocalizedField(item, "description", lang)}
                                        </p>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {links.length > 0 ? (
                        <div className="mt-5 flex flex-wrap gap-3">
                            {links.map((link, index) => (
                                <Link
                                    key={link.id}
                                    to={link.to}
                                    className={
                                        index === 0
                                            ? "inline-flex items-center justify-center rounded-full bg-[#1f5e54] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18463e]"
                                            : "inline-flex items-center justify-center rounded-full border border-[#a7cfc1] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f5e54] transition hover:bg-[#eef7f3]"
                                    }
                                >
                                    {getLocalizedField(link, "label", lang)}
                                </Link>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

function ContactCard({ contact, lang }) {
    return (
        <article className="surface-card rounded-[1.5rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
            <h3 className="text-xl text-slate-900">{getLocalizedField(contact, "name", lang)}</h3>
            {getLocalizedField(contact, "role", lang) ? (
                <p className="mt-1 text-sm font-medium text-[#1f5e54]">{getLocalizedField(contact, "role", lang)}</p>
            ) : null}
            {getLocalizedField(contact, "description", lang) ? (
                <p className="mt-3 text-sm text-slate-600 sm:text-base">{getLocalizedField(contact, "description", lang)}</p>
            ) : null}
            <div className="mt-4 grid gap-2 text-sm text-slate-700">
                {contact.phone ? <p>{contact.phone}</p> : null}
                {contact.email ? <p>{contact.email}</p> : null}
                {getLocalizedField(contact, "address", lang) ? <p>{getLocalizedField(contact, "address", lang)}</p> : null}
                {getLocalizedField(contact, "hours", lang) ? <p>{getLocalizedField(contact, "hours", lang)}</p> : null}
            </div>
        </article>
    );
}

export default function Guide() {
    const { lang } = useLocale();
    const [status, setStatus] = useState("loading");
    const [content, setContent] = useState(EMPTY_CONTENT);
    const [sectionVisibility, setSectionVisibility] = useState(defaultSectionVisibility);

    useEffect(() => {
        let isMounted = true;

        async function syncGuide() {
            try {
                setStatus("loading");
                const [visibility, siteContent] = await Promise.all([getSectionVisibility(), getSiteContent()]);

                if (!isMounted) return;

                setSectionVisibility(visibility);
                setContent(siteContent);
                setStatus("ready");
            } catch (error) {
                console.error("Unable to load guide:", error);

                if (isMounted) {
                    setStatus("error");
                }
            }
        }

        syncGuide();

        return () => {
            isMounted = false;
        };
    }, []);

    function isRouteVisible(route) {
        const key = getSectionKeyFromRoute(route);
        return key ? sectionVisibility[key] : false;
    }

    const alerts = getLocalizedList(content, "alerts", lang).slice(0, 2);
    const visitorTips = getLocalizedList(content, "visitorTips", lang).slice(0, 3);

    const heroActions = [content.hero?.primaryCta, content.hero?.secondaryCta]
        .filter(Boolean)
        .filter((cta) => isRouteVisible(cta.to));

    const visibleQuickLinks = useMemo(
        () => content.quickLinks.filter((item) => isRouteVisible(item.to)),
        [content.quickLinks, sectionVisibility]
    );

    const visibleGuideSections = useMemo(
        () =>
            content.guideSections
                .map((section) => ({
                    ...section,
                    links: section.links.filter((link) => isRouteVisible(link.to)),
                }))
                .filter(
                    (section) =>
                        getLocalizedField(section, "title", lang) ||
                        getLocalizedField(section, "summary", lang) ||
                        section.items.length > 0 ||
                        section.links.length > 0
                ),
        [content.guideSections, lang, sectionVisibility]
    );

    if (status === "loading") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Loading guide" : "Chargement du guide"}
                description={
                    lang === "en"
                        ? "The practical guide is being prepared."
                        : "Le guide pratique est en cours de chargement."
                }
            />
        );
    }

    if (status === "error") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Unable to load guide" : "Chargement impossible"}
                description={
                    lang === "en"
                        ? "The practical guide cannot be displayed right now."
                        : "Le guide pratique ne peut pas être affiché pour le moment."
                }
                linkTo="/"
                linkLabel={lang === "en" ? "Back to home" : "Retour à l'accueil"}
            />
        );
    }

    const heroTitle =
        getLocalizedField(content.hero, "title", lang) ||
        (lang === "en" ? "Visit Fontaine-de-Vaucluse in a few simple steps" : "Visiter Fontaine-de-Vaucluse en quelques étapes simples");
    const heroDescription =
        getLocalizedField(content.hero, "description", lang) ||
        (lang === "en"
            ? "This page brings together the key practical information for a short visit."
            : "Cette page rassemble les repères pratiques les plus utiles pour une visite ponctuelle.");

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

                        {heroActions.length > 0 ? (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {heroActions.map((action, index) => (
                                    <Link
                                        key={action.id || action.to}
                                        to={action.to}
                                        className={
                                            index === 0
                                                ? "rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#163c35] transition hover:bg-[#f6f3ea]"
                                                : "rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.16]"
                                        }
                                    >
                                        {getLocalizedField(action, "label", lang)}
                                    </Link>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <aside className="rounded-[1.75rem] border border-white/15 bg-[#163c35]/40 p-5 backdrop-blur-md">
                        <p className="section-kicker text-[#d7e8e1]">
                            {lang === "en" ? "Keep in mind" : "À garder en tête"}
                        </p>
                        <div className="mt-4 grid gap-3">
                            {alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <div key={alert} className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                                        <p className="text-sm text-white/90">{alert}</p>
                                    </div>
                                ))
                            ) : (
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
                            )}
                        </div>
                    </aside>
                </div>
            </section>

            {visibleGuideSections.length > 0 ? (
                <section className="mb-8">
                    <div className="mb-4">
                        <p className="section-kicker">{lang === "en" ? "Visitor path" : "Parcours visiteur"}</p>
                        <h2 className="mt-2 text-2xl text-[#163c35] sm:text-3xl">
                            {lang === "en" ? "Practical steps" : "Étapes pratiques"}
                        </h2>
                    </div>
                    <div className="grid gap-5">
                        {visibleGuideSections.map((section, index) => (
                            <SectionCard
                                key={section.id}
                                number={index + 1}
                                title={getLocalizedField(section, "title", lang)}
                                summary={getLocalizedField(section, "summary", lang)}
                                items={section.items}
                                links={section.links}
                                lang={lang}
                            />
                        ))}
                    </div>
                </section>
            ) : (
                <section className="mb-8">
                    <div className="surface-card rounded-[1.75rem] border border-white/70 p-5 text-slate-600 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                        {lang === "en" ? "No practical section has been added yet." : "Aucune section pratique n'a encore été ajoutée."}
                    </div>
                </section>
            )}

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

            {content.contacts.length > 0 ? (
                <section className="mb-8">
                    <div className="mb-4">
                        <p className="section-kicker">{lang === "en" ? "Useful contacts" : "Contacts utiles"}</p>
                        <h2 className="mt-2 text-2xl text-[#163c35] sm:text-3xl">
                            {lang === "en" ? "Keep these contacts handy" : "Garder ces contacts sous la main"}
                        </h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                        {content.contacts.map((contact) => (
                            <ContactCard key={contact.id} contact={contact} lang={lang} />
                        ))}
                    </div>
                </section>
            ) : null}

            {visibleQuickLinks.length > 0 ? (
                <section>
                    <article className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6">
                        <p className="section-kicker">{lang === "en" ? "Need something else?" : "Besoin d'autre chose ?"}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {visibleQuickLinks.slice(0, 4).map((item) => (
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
            ) : null}
        </Layout>
    );
}
