import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const linkClass = ({ isActive }) =>
        isActive
            ? "text-white font-semibold border-b-2 border-[#e1d1ae] pb-1"
            : "text-[#d7e8e1] hover:text-white transition";

    const mobileLinkClass = ({ isActive }) =>
        isActive
            ? "block rounded-xl bg-[#2d7467] px-4 py-3 text-white font-semibold"
            : "block rounded-xl px-4 py-3 text-[#d7e8e1] hover:bg-[#2d7467] hover:text-white transition";

    return (
        <header className="bg-[#1f5e54] text-white shadow-md sticky top-0 z-[1000]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
                <Link to="/" className="flex items-center gap-3 min-w-0">
                    <img
                        src="/logo-fontaine.png"
                        alt="Logo Fontaine-de-Vaucluse"
                        className="h-11 w-11 sm:h-14 sm:w-14 object-contain rounded-full bg-white/10 p-1 shrink-0"
                    />
                    <div className="min-w-0">
                        <p className="text-base sm:text-xl font-bold leading-tight truncate">
                            Fontaine Info
                        </p>
                        <p className="text-xs sm:text-sm text-[#d7e8e1] leading-tight truncate">
                            Fontaine-de-Vaucluse
                        </p>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <NavLink to="/" className={linkClass}>
                        Accueil
                    </NavLink>
                    <NavLink to="/news" className={linkClass}>
                        Actualités
                    </NavLink>
                    <NavLink to="/events" className={linkClass}>
                        Événements
                    </NavLink>
                    <NavLink to="/hikes" className={linkClass}>
                        Randonnées
                    </NavLink>
                </nav>

                <button
                    type="button"
                    className="md:hidden inline-flex items-center justify-center rounded-xl border border-[#a7cfc1] px-3 py-2 text-white shrink-0"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Ouvrir le menu"
                    aria-expanded={isOpen}
                >
                    <span className="text-sm font-medium">{isOpen ? "Fermer" : "Menu"}</span>
                </button>
            </div>

            {isOpen && (
                <div className="md:hidden px-4 sm:px-6 pb-4">
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
                    </nav>
                </div>
            )}
        </header>
    );
}