import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { getSectionVisibility } from "../data/loader";
import { defaultSectionVisibility, sectionRoutes } from "../data/sections";
import { useLocale } from "../useLocale";

export default function Navbar() {
    const location = useLocation();
    const { lang, setLang, t } = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [sectionVisibility, setSectionVisibility] = useState(defaultSectionVisibility);
    const isOpenRef = useRef(isOpen);

    const navItems = [
        { key: "guide", to: sectionRoutes.guide, label: t("common.guide") },
        { key: "parkings", to: sectionRoutes.parkings, label: t("common.parkings"), highlight: true },
        { key: "events", to: sectionRoutes.events, label: t("common.events") },
        { key: "hikes", to: sectionRoutes.hikes, label: t("common.hikes") },
        { key: "news", to: sectionRoutes.news, label: t("common.news") },
    ];

    useEffect(() => {
        getSectionVisibility().then(setSectionVisibility);
    }, []);

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    useEffect(() => {
        if (!isOpenRef.current) {
            return undefined;
        }

        const closeMenu = window.setTimeout(() => {
            setIsOpen(false);
        }, 0);

        return () => {
            window.clearTimeout(closeMenu);
        };
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const visibleNavItems = navItems.filter((item) => sectionVisibility[item.key]);

    const linkClass = ({ isActive }, highlight = false) => {
        if (isActive) {
            return "rounded-full bg-white px-3 py-2 font-semibold text-[#163c35]";
        }

        if (highlight) {
            return "rounded-full bg-[#e1d1ae] px-3 py-2 font-semibold text-[#163c35] transition hover:bg-[#f0e4c8]";
        }

        return "rounded-full px-3 py-2 text-[#d7e8e1] transition hover:bg-[#2d7467] hover:text-white";
    };

    const mobileLinkClass = ({ isActive }, highlight = false) => {
        if (isActive) {
            return "block rounded-xl bg-white px-4 py-3 font-semibold text-[#163c35]";
        }

        if (highlight) {
            return "block rounded-xl bg-[#e1d1ae] px-4 py-3 font-semibold text-[#163c35]";
        }

        return "block rounded-xl px-4 py-3 text-[#d7e8e1] transition hover:bg-[#2d7467] hover:text-white";
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

                <div className="hidden items-center gap-3 md:flex">
                    <nav className="flex items-center gap-2">
                        <NavLink to="/" end className={(state) => linkClass(state)}>
                            {t("common.home")}
                        </NavLink>
                        {visibleNavItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={(state) => linkClass(state, item.highlight)}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                    {languageSwitcher}
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    {languageSwitcher}
                    <button
                        type="button"
                        className="inline-flex shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white transition hover:bg-white/[0.15]"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={t("common.menu")}
                        aria-expanded={isOpen}
                        aria-controls="mobile-navigation"
                    >
                        <span className="text-sm font-medium">{isOpen ? t("common.close") : t("common.menu")}</span>
                    </button>
                </div>
            </div>

            <div className="border-t border-white/10 bg-[#19493f] md:hidden">
                <div className="mx-auto max-w-6xl overflow-x-auto px-4 py-2 sm:px-6">
                    <nav className="flex min-w-max gap-2">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                isActive
                                    ? "rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#163c35]"
                                    : "rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-[#d7e8e1] transition hover:bg-white/10"
                            }
                        >
                            {t("common.home")}
                        </NavLink>
                        {visibleNavItems.map((item) => (
                            <NavLink
                                key={`mobile-shortcut-${item.to}`}
                                to={item.to}
                                className={({ isActive }) =>
                                    isActive
                                        ? "rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#163c35]"
                                        : item.highlight
                                            ? "rounded-full bg-[#e1d1ae] px-3 py-2 text-sm font-semibold text-[#163c35] transition hover:bg-[#f0e4c8]"
                                            : "rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-[#d7e8e1] transition hover:bg-white/10"
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>

            {isOpen && (
                <div
                    id="mobile-navigation"
                    className="border-t border-white/10 bg-[#163c35] px-4 pb-4 pt-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:px-6 md:hidden"
                >
                    <nav className="mx-auto grid max-w-6xl gap-2">
                        <NavLink
                            to="/"
                            end
                            className={(state) => mobileLinkClass(state)}
                            onClick={() => setIsOpen(false)}
                        >
                            {t("common.home")}
                        </NavLink>
                        {visibleNavItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={(state) => mobileLinkClass(state, item.highlight)}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
