import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const linkClass = ({ isActive }) =>
        isActive
            ? "border-b-2 border-[#e1d1ae] pb-1 font-semibold text-white"
            : "text-[#d7e8e1] transition hover:text-white";

    const mobileLinkClass = ({ isActive }) =>
        isActive
            ? "block rounded-xl bg-[#2d7467] px-4 py-3 font-semibold text-white"
            : "block rounded-xl px-4 py-3 text-[#d7e8e1] transition hover:bg-[#2d7467] hover:text-white";

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

                <nav className="hidden items-center gap-6 md:flex">
                    <NavLink to="/" className={linkClass}>Accueil</NavLink>
                    <NavLink to="/news" className={linkClass}>Actualités</NavLink>
                    <NavLink to="/events" className={linkClass}>Événements</NavLink>
                    <NavLink to="/hikes" className={linkClass}>Randonnées</NavLink>
                    <NavLink to="/parking" className={linkClass}>Parkings</NavLink>
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
                        <NavLink to="/" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                            Accueil
                        </NavLink>
                        <NavLink to="/news" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                            Actualités
                        </NavLink>
                        <NavLink to="/events" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                            Événements
                        </NavLink>
                        <NavLink to="/hikes" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                            Randonnées
                        </NavLink>
                        <NavLink to="/parking" className={mobileLinkClass} onClick={() => setIsOpen(false)}>
                            Parkings
                        </NavLink>
                    </nav>
                </div>
            )}
        </header>
    );
}
