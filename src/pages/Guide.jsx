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
        title: "Preparer une visite agreable a Fontaine-de-Vaucluse",
        titleEn: "Plan an enjoyable visit to Fontaine-de-Vaucluse",
        description:
            "Retrouvez ici les reperes utiles pour arriver plus sereinement et profiter du village sans vous compliquer la journee.",
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

function ContactCard({ contact, lang }) {
    const name = getLocalizedField(contact, "name", lang);
    const role = getLocalizedField(contact, "role", lang);
    const description = getLocalizedField(contact, "description", lang);
    const address = getLocalizedField(contact, "address", lang);
    const hours = getLocalizedField(contact, "hours", lang);

    return (
        <article className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-lg font-semibold text-[#163c35]">{name}</p>
                    {role ? <p className="mt-1 text-sm font-medium text-[#1f5e54]">{role}</p> : null}
                </div>
                <div className="rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5e54]">
                    {lang === "en" ? "Useful contact" : "Contact utile"}
                </div>
            </div>

            {description ? <p className="mt-4 text-sm text-slate-600 sm:text-base">{description}</p> : null}

            <div className="mt-5 grid gap-3 text-sm text-slate-700">
                {address ? <InfoPill>{address}</InfoPill> : null}
                {hours ? <InfoPill>{hours}</InfoPill> : null}
            </div>

            {(contact.phone || contact.email) && (
                <div className="mt-5 flex flex-wrap gap-3">
                    {contact.phone ? (
                        <a
                            href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                            className="inline-flex items-center justify-center rounded-full bg-[#1f5e54] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18463e]"
                        >
                            {lang === "en" ? "Call" : "Appeler"} {contact.phone}
                        </a>
                    ) : null}
                    {contact.email ? (
                        <a
                            href={`mailto:${contact.email}`}
                            className="inline-flex items-center justify-center rounded-full border border-[#a7cfc1] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f5e54] transition hover:bg-[#eef7f3]"
                        >
                            {lang === "en" ? "Write" : "Ecrire"}
                        </a>
                    ) : null}
                </div>
            )}
        </article>
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
    const visitorTips = getLocalizedList(content, "visitorTips", lang).slice(0, 4);
    const contacts = Array.isArray(content.contacts) ? content.contacts.slice(0, 4) : [];
    const routeVisibility = useMemo(
        () => ({
            [sectionRoutes.guide]: true,
            [sectionRoutes.parkings]: sectionVisibility.parkings,
            [sectionRoutes.events]: sectionVisibility.events,
            [sectionRoutes.news]: sectionVisibility.news,
            [sectionRoutes.photos]: sectionVisibility.photos,
            [sectionRoutes.hikes]: sectionVisibility.hikes,
            "/": true,
        }),
        [sectionVisibility]
    );
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
    const guideSections = useMemo(
        () =>
            content.guideSections
                .map((section) => ({
                    ...section,
                    links: section.links.filter((link) => routeVisibility[link.to] !== false),
                }))
                .filter((section) => section.items.length > 0 || section.links.length > 0),
        [content.guideSections, routeVisibility]
    );
    const heroTitle =
        getLocalizedField(content.hero, "title", lang) ||
        (lang === "en" ? "Practical information for visitors and residents" : "Infos pratiques pour visiteurs et habitants");
    const heroDescription =
        getLocalizedField(content.hero, "description", lang) ||
        (lang === "en"
            ? "Find the right local contacts, what to check before arriving, and the practical information to keep the day simple."
            : "Retrouvez les bons contacts, les points a verifier avant de venir et les informations pratiques qui simplifient la journee.");
    const heroPrimaryCta = content.hero?.primaryCta && routeVisibility[content.hero.primaryCta.to] !== false ? content.hero.primaryCta : null;
    const heroSecondaryCta =
        content.hero?.secondaryCta && routeVisibility[content.hero.secondaryCta.to] !== false ? content.hero.secondaryCta : null;

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
                        {(heroPrimaryCta || heroSecondaryCta) && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {heroPrimaryCta ? (
                                    <Link
                                        to={heroPrimaryCta.to}
                                        className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#163c35] transition hover:bg-[#eef7f3]"
                                    >
                                        {getLocalizedField(heroPrimaryCta, "label", lang)}
                                    </Link>
                                ) : null}
                                {heroSecondaryCta ? (
                                    <Link
                                        to={heroSecondaryCta.to}
                                        className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                                    >
                                        {getLocalizedField(heroSecondaryCta, "label", lang)}
                                    </Link>
                                ) : null}
                            </div>
                        )}
                    </div>

                    <aside className="rounded-[1.75rem] border border-white/15 bg-[#163c35]/40 p-5 backdrop-blur-md">
                        <p className="section-kicker text-[#d7e8e1]">{lang === "en" ? "At a glance" : "En un coup d'oeil"}</p>
                        <div className="mt-4 grid gap-3">
                            {alerts.length > 0
                                ? alerts.map((alert) => (
                                      <div key={alert} className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                                          <p className="text-sm text-white/90">{alert}</p>
                                      </div>
                                  ))
                                : visitorTips.slice(0, 2).map((tip) => (
                                      <div key={tip} className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                                          <p className="text-sm text-white/90">{tip}</p>
                                      </div>
                                  ))}
                        </div>
                    </aside>
                </div>
            </section>

            {visitorTips.length > 0 && (
                <section className="mb-8">
                    <div className="mb-4">
                        <p className="section-kicker">{lang === "en" ? "Good to know" : "Bons reperes"}</p>
                        <h2 className="mt-2 text-2xl text-[#163c35] sm:text-3xl">
                            {lang === "en" ? "Useful practical reminders" : "Quelques reflexes utiles"}
                        </h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {visitorTips.map((tip) => (
                            <InfoPill key={tip}>{tip}</InfoPill>
                        ))}
                    </div>
                </section>
            )}

            {guideSections.length > 0 && (
                <section className="mb-8">
                    <div className="mb-4">
                        <p className="section-kicker">{lang === "en" ? "Practical guide" : "Guide pratique"}</p>
                        <h2 className="mt-2 text-2xl text-[#163c35] sm:text-3xl">
                            {lang === "en" ? "What to check before and during your visit" : "Ce qu'il faut verifier avant et pendant la visite"}
                        </h2>
                    </div>
                    <div className="grid gap-5">
                        {guideSections.map((section) => (
                            <article
                                key={section.id}
                                className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6"
                            >
                                <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
                                    <div>
                                        <p className="section-kicker">{lang === "en" ? "Section" : "Rubrique"}</p>
                                        <h3 className="mt-2 text-2xl text-[#163c35]">
                                            {getLocalizedField(section, "title", lang)}
                                        </h3>
                                        <p className="mt-3 text-sm text-slate-600 sm:text-base">
                                            {getLocalizedField(section, "summary", lang)}
                                        </p>
                                        {section.links.length > 0 && (
                                            <div className="mt-5 flex flex-wrap gap-3">
                                                {section.links.map((link) => (
                                                    <Link
                                                        key={link.id}
                                                        to={link.to}
                                                        className="inline-flex items-center justify-center rounded-full border border-[#a7cfc1] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f5e54] transition hover:bg-[#eef7f3]"
                                                    >
                                                        {getLocalizedField(link, "label", lang)}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-4">
                                        {section.items.map((item, index) => (
                                            <StepCard
                                                key={item.id}
                                                number={index + 1}
                                                title={getLocalizedField(item, "title", lang)}
                                                body={getLocalizedField(item, "description", lang)}
                                                to={section.links[0]?.to || "/"}
                                                cta={
                                                    section.links[0]
                                                        ? getLocalizedField(section.links[0], "label", lang)
                                                        : lang === "en"
                                                          ? "Back to home"
                                                          : "Retour a l'accueil"
                                                }
                                                secondary={
                                                    section.links[1] ? (
                                                        <Link
                                                            to={section.links[1].to}
                                                            className="inline-flex items-center justify-center rounded-full border border-[#a7cfc1] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f5e54] transition hover:bg-[#eef7f3]"
                                                        >
                                                            {getLocalizedField(section.links[1], "label", lang)}
                                                        </Link>
                                                    ) : null
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {contacts.length > 0 && (
                <section className="mb-8">
                    <div className="mb-4">
                        <p className="section-kicker">{lang === "en" ? "Contacts" : "Contacts"}</p>
                        <h2 className="mt-2 text-2xl text-[#163c35] sm:text-3xl">
                            {lang === "en" ? "Who to contact" : "Qui contacter"}
                        </h2>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                        {contacts.map((contact) => (
                            <ContactCard key={contact.id} contact={contact} lang={lang} />
                        ))}
                    </div>
                </section>
            )}

            <section className="mb-8">
                <div className="mb-4">
                    <p className="section-kicker">{lang === "en" ? "Quick access" : "Acces rapide"}</p>
                    <h2 className="mt-2 text-2xl text-[#163c35] sm:text-3xl">
                        {lang === "en" ? "Go to the right page" : "Aller vers la bonne page"}
                    </h2>
                </div>
                {visibleQuickLinks.length > 0 && (
                    <article className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6">
                        <p className="section-kicker">{lang === "en" ? "Need something else?" : "Besoin d'autre chose ?"}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {visibleQuickLinks.slice(0, 6).map((item) => (
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
                )}
            </section>
        </Layout>
    );
}
