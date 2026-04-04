import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="bg-blue-600 text-white px-6 py-4 flex gap-6 shadow">
            <Link to="/" className="font-bold text-lg">Ville</Link>
            <Link to="/news">Actualités</Link>
            <Link to="/events">Événements</Link>
            <Link to="/hikes">Randonnées</Link>
        </nav>
    );
}