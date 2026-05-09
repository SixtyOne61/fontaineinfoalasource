import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { getSectionVisibility } from "../data/loader";
import { defaultSectionVisibility, sectionRoutes } from "../data/sections";
import { useLocale } from "../useLocale";

let savedNavScrollLeft = 0;

export default function Navbar() {
    const { lang, setLang, t } = useLocale();
    const [sectionVisibility, setSectionVisibility] = useState(defaultSectionVisibility);
    const navScrollRef = useRef(null);

    const navItems = [
        { key: "home", to: "/", label: t("common.home") },
        { key: "guide", to: sectionRoutes.guide, label: t("common.guide"), shortLabel: lang === "en" ? "Visit" : "Visite" },
        { key: "parkings", to: sectionRoutes.parkings, label: t("common.parkings"), shortLabel: lang === "en" ? "Parking" : "Parking", highlight: true },
        { key: "events", to: sectionRoutes.events, label: t("common.events"), shortLabel: lang === "en" ? "Today" : "Aujourd'hui" },
        { key: "hikes", to: sectionRoutes.hikes, label: t("common.hikes"), shortLabel: lang === "en" ? "Walks" : "Balades" },
        { key: "photos", to: sectionRoutes.photos, label: t("common.photos"), shortLabel: t("common.photos") },
        { key: "news", to: sectionRoutes.news, label: t("common.news"), shortLabel: lang === "en" ? "Info" : "Infos" }
    ];

    useEffect(() => {
        getSectionVisibility().then(setSectionVisibility);
    }, []);

    useEffect(() => {
        const navNode = navScrollRef.current;

        if (!navNode) return undefined;

        const handleScroll = () => {
            savedNavScrollLeft = navNode.scrollLeft;
        };

        navNode.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            savedNavScrollLeft = navNode.scrollLeft;
            navNode.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const visibleNavItems = navItems.filter((item) => item.key === "home" || sectionVisibility[item.key]);

    useLayoutEffect(() => {
        const navNode = navScrollRef.current;

        if (!navNode) return;

        navNode.scrollLeft = savedNavScrollLeft;
    }, [lang, visibleNavItems.length]);

    const linkClass = ({ isActive }, highlight = false) => {
        if (isActive) {
            return "rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#163c35] shadow-[0_10px_24px_rgba(12,36,31,0.12)]";
        }

        if (highlight) {
            return "rounded-full bg-[#e1d1ae] px-4 py-2 text-sm font-semibold text-[#163c35] transition hover:bg-[#f0e4c8]";
        }

        return "rounded-full bg-white/8 px-4 py-2 text-sm font-medium text-[#e7f1ed] transition hover:bg-white/14 hover:text-white";
    };

    const languageSwitcher = (
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1">
            {["fr", "en"].map((nextLang) => {
                const isActive = lang === nextLang;

                return (
                    <button
                        key={nextLang}
                        type="button"
                        onClick={() => setLang(nextLang)}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                            isActive ? "bg-white text-[#163c35]" : "text-white/85 hover:bg-white/10"
                        }`}
                        aria-pressed={isActive}
                    >
                        {nextLang.toUpperCase()}
                    </button>
                );
            })}
        </div>
    );

    return (
        <header className="sticky top-0 z-[1000] border-b border-white/10 bg-[#1f5e54]/95 text-white shadow-[0_14px_40px_rgba(22,60,53,0.18)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#1f5e54]/90">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
                <Link to="/" className="flex min-w-0 items-center gap-3">
                    <img
                        src="/logo-fontaine.png"
                        alt="Logo Fontaine-de-Vaucluse"
                        className="h-11 w-11 shrink-0 rounded-full bg-white/10 p-1 object-contain sm:h-14 sm:w-14"
                    />
                    <div className="min-w-0">
                        <p className="truncate text-base font-bold leading-tight sm:text-xl">
                            Info à la source
                        </p>
                        <p className="truncate text-xs leading-tight text-[#d7e8e1] sm:text-sm">
                            Fontaine-de-Vaucluse
                        </p>
                    </div>
                </Link>

                <div className="shrink-0">
                    {languageSwitcher}
                </div>
            </div>

            <div className="border-t border-white/10 bg-[#18463e]/80">
                <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
                    <nav
                        aria-label={lang === "en" ? "Main navigation" : "Navigation principale"}
                        className="overflow-x-auto"
                        ref={navScrollRef}
                    >
                        <div className="flex min-w-max gap-2 pb-1">
                            {visibleNavItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === "/"}
                                    className={(state) => linkClass(state, item.highlight)}
                                    aria-label={item.label}
                                >
                                    <span className="sm:hidden">{item.shortLabel || item.label}</span>
                                    <span className="hidden sm:inline">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
