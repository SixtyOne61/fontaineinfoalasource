import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { getSiteContent } from "../data/loader";
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
        secondaryCta: null
    },
    quickLinks: [],
    highlights: [],
    guideSections: [],
    contacts: [],
    visitorTips: [],
    visitorTipsEn: [],
    alerts: [],
    alertsEn: []
};

function GuideLink({ item, primary = false, lang }) {
    if (!item?.to || !getLocalizedField(item, "label", lang)) {
        return null;
    }

    return (
        <Link
            to={item.to}
            className={
                primary
                    ? "inline-flex items-center justify-center rounded-full bg-[#1f5e54] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18463e]"
                    : "inline-flex items-center justify-center rounded-full border border-[#a7cfc1] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f5e54] transition hover:bg-[#eef7f3]"
            }
        >
            {getLocalizedField(item, "label", lang)}
        </Link>
    );
}

export default function Guide() {
    const location = useLocation();
    const { lang, t } = useLocale();
    const [content, setContent] = useState(EMPTY_CONTENT);

    useEffect(() => {
        getSiteContent().then((data) => {
            setContent(data);
        });
    }, []);

    const heroLinks = [content.hero.primaryCta, content.hero.secondaryCta].filter(
        (item) => item?.to && item.to !== location.pathname
    );
    const visibleQuickLinks = content.quickLinks.filter((item) => item.to !== location.pathname);
    const alerts = getLocalizedList(content, "alerts", lang);
    const visitorTips = getLocalizedList(content, "visitorTips", lang);

    return (
        <Layout>
            <section className="mb-6 overflow-hidden rounded-[2rem] border border-white/20 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_30%),linear-gradient(135deg,#18463e,#27685b_54%,#d3bc8d)] p-5 text-white shadow-[0_28px_90px_rgba(22,60,53,0.18)] sm:mb-8 sm:p-8 md:p-10">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                    <div>
                        <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white/90">
                            {getLocalizedField(content.hero, "eyebrow", lang)}
                        </div>
                        <h1 className="mt-4 text-3xl leading-tight text-white sm:text-5xl">
                            {getLocalizedField(content.hero, "title", lang)}
                        </h1>
                        <p className="mt-4 max-w-2xl text-base text-[#eef7f3] sm:text-lg">
                            {getLocalizedField(content.hero, "description", lang)}
                        </p>

                        {heroLinks.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {heroLinks.map((item, index) => (
                                    <GuideLink key={item.id} item={item} primary={index === 0} lang={lang} />
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="grid gap-3 rounded-[1.75rem] border border-white/15 bg-[#163c35]/40 p-4 backdrop-blur-md">
                        <p className="section-kicker text-[#d7e8e1]">
                            {lang === "en" ? "Quick overview" : "Repères rapides"}
                        </p>
                        {content.highlights.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3"
                            >
                                <p className="text-sm text-[#d7e8e1]">{getLocalizedField(item, "tag", lang) || getLocalizedField(item, "title", lang)}</p>
                                <p className="mt-1 text-lg font-semibold text-white">
                                    {getLocalizedField(item, "value", lang) || getLocalizedField(item, "title", lang)}
                                </p>
                                <p className="mt-1 text-sm text-white/80">{getLocalizedField(item, "description", lang)}</p>
                            </div>
                        ))}
                    </aside>
                </div>
            </section>

            {alerts.length > 0 && (
                <section className="mb-6 grid gap-3">
                    {alerts.map((alert) => (
                        <article
                            key={alert}
                            className="rounded-[1.5rem] border border-[#d8c08f]/60 bg-[#fff7e6] px-4 py-3 text-sm text-[#6f5627] shadow-[0_14px_40px_rgba(111,86,39,0.08)]"
                        >
                            {alert}
                        </article>
                    ))}
                </section>
            )}

            {visibleQuickLinks.length > 0 && (
                <section className="mb-8">
                    <div className="surface-card rounded-[1.75rem] border border-white/70 p-4 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-5">
                        <p className="section-kicker">{lang === "en" ? "Useful shortcuts" : "Accès utiles"}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {visibleQuickLinks.map((item) => (
                                <Link
                                    key={item.id}
                                    to={item.to}
                                    className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 transition hover:-translate-y-1 hover:border-[#a7cfc1]"
                                >
                                    <p className="section-kicker">{getLocalizedField(item, "badge", lang) || t("common.guide")}</p>
                                    <h2 className="mt-2 text-xl text-[#163c35]">{getLocalizedField(item, "title", lang)}</h2>
                                    <p className="mt-2 text-sm text-slate-600">{getLocalizedField(item, "description", lang)}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {content.guideSections.length > 0 && (
                <section className="grid gap-5 sm:gap-6">
                    {content.guideSections.map((section) => (
                        <article
                            key={section.id}
                            className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6"
                        >
                            <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
                                <div>
                                    <p className="section-kicker">{lang === "en" ? "Helpful guide" : "Guide pratique"}</p>
                                    <h2 className="mt-2 text-2xl text-[#163c35] sm:text-3xl">
                                        {getLocalizedField(section, "title", lang)}
                                    </h2>
                                    <p className="mt-3 text-sm text-slate-600 sm:text-base">
                                        {getLocalizedField(section, "summary", lang)}
                                    </p>

                                    {section.links.some((item) => item.to !== location.pathname) && (
                                        <div className="mt-5 flex flex-wrap gap-3">
                                            {section.links
                                                .filter((item) => item.to !== location.pathname)
                                                .map((item, index) => (
                                                    <GuideLink
                                                        key={item.id}
                                                        item={item}
                                                        primary={index === 0}
                                                        lang={lang}
                                                    />
                                                ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    {section.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4"
                                        >
                                            <h3 className="text-lg text-[#163c35]">{getLocalizedField(item, "title", lang)}</h3>
                                            <p className="mt-2 text-sm text-slate-600">
                                                {getLocalizedField(item, "description", lang)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            )}

            {visitorTips.length > 0 && (
                <section className="mt-8">
                    <article className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6">
                        <p className="section-kicker">{lang === "en" ? "Visitor tips" : "Quelques conseils"}</p>
                        <h2 className="mt-2 text-2xl text-[#163c35]">{lang === "en" ? "Before you set off" : "Avant de partir"}</h2>
                        <div className="mt-4 grid gap-3">
                            {visitorTips.map((tip) => (
                                <div
                                    key={tip}
                                    className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                                >
                                    {tip}
                                </div>
                            ))}
                        </div>
                    </article>
                </section>
            )}
        </Layout>
    );
}
