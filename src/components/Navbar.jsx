import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { getSectionVisibility } from "../data/loader";
import { defaultSectionVisibility, sectionRoutes } from "../data/sections";

const navItems = [
    { key: "parkings", to: sectionRoutes.parkings, label: "Parkings", highlight: true },
    { key: "events", to: sectionRoutes.events, label: "Événements" },
    { key: "hikes", to: sectionRoutes.hikes, label: "Randonnées" },
    { key: "news", to: sectionRoutes.news, label: "Actualités" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [sectionVisibility, setSectionVisibility] = useState(defaultSectionVisibility);

    useEffect(() => {
        getSectionVisibility().then(setSectionVisibility);
    }, []);

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

    return (
        <header className="sticky top-0 z-[1000] bg-[#1f5e54] text-white shadow-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
                <Link to="/" className="flex min-w-0 items-center gap-3">
                    <img
                        src="/logo-fontaine.png"
                        alt="Logo Fontaine-de-Vaucluse"
                        className="h-11 w-11 shrink-0 rounded-full bg-white/10 p-1 object-contain sm:h-14 sm:w-14"
                    />
                    <div className="min-w-0">
                        <p className="truncate text-base font-bold leading-tight sm:text-xl">
                            Fontaine Info
                        </p>
                        <p className="truncate text-xs leading-tight text-[#d7e8e1] sm:text-sm">
                            Fontaine-de-Vaucluse
                        </p>
                    </div>
                </Link>

                <nav className="hidden items-center gap-2 md:flex">
                    <NavLink to="/" className={(state) => linkClass(state)}>
                        Accueil
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

                <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#a7cfc1] px-3 py-2 text-white md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Ouvrir le menu"
                    aria-expanded={isOpen}
                >
                    <span className="text-sm font-medium">{isOpen ? "Fermer" : "Menu"}</span>
                </button>
            </div>

            {isOpen && (
                <div className="px-4 pb-4 sm:px-6 md:hidden">
                    <nav className="flex flex-col gap-2">
                        <NavLink to="/" className={(state) => mobileLinkClass(state)} onClick={() => setIsOpen(false)}>
                            Accueil
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
