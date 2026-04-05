import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
    const linkClass = ({ isActive }) =>
        isActive
            ? "text-white font-semibold border-b-2 border-white pb-1"
            : "text-blue-100 hover:text-white transition";

    return (
        <header className="bg-blue-700 text-white shadow">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold">
                    Fontaine Info
                </Link>

                <nav className="flex items-center gap-6">
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
            </div>
        </header>
    );
}