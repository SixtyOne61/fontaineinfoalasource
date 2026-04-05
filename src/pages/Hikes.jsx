import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import HikesInteractiveMap from "../components/HikesInteractiveMap";
import SearchBar from "../components/SearchBar";
import { getHikes } from "../data/loader";

export default function Hikes() {
    const [hikes, setHikes] = useState([]);
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("all");
    const [selectedHike, setSelectedHike] = useState(null);

    useEffect(() => {
        getHikes().then((data) => {
            const sorted = [...data].sort((a, b) => a.distance - b.distance);
            setHikes(sorted);
            setSelectedHike(sorted[0] || null);
        });
    }, []);

    const filteredHikes = useMemo(() => {
        const term = search.toLowerCase();

        return hikes.filter((hike) => {
            const matchesDifficulty =
                difficulty === "all" || hike.difficulty === difficulty;

            const matchesSearch =
                hike.name?.toLowerCase().includes(term) ||
                hike.description?.toLowerCase().includes(term) ||
                hike.startPoint?.toLowerCase().includes(term);

            return matchesDifficulty && matchesSearch;
        });
    }, [hikes, search, difficulty]);

    useEffect(() => {
        if (!filteredHikes.length) {
            setSelectedHike(null);
            return;
        }

        const stillExists = filteredHikes.some(
            (hike) => hike.id === selectedHike?.id
        );

        if (!stillExists) {
            setSelectedHike(filteredHikes[0]);
        }
    }, [filteredHikes, selectedHike]);

    const handleSelectHike = (hike) => {
        setSelectedHike(hike);
    };

    return (
        <Layout>
            <section className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#163c35]">Randonnées</h1>
                <p className="mt-2 text-slate-600 max-w-2xl text-sm sm:text-base">
                    Consultez les parcours disponibles autour de la commune, visualisez leur
                    position sur la carte et affichez directement le tracé d’une randonnée.
                </p>
            </section>

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher une randonnée..."
            />

            <div className="mb-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                {["all", "Facile", "Moyen", "Difficile"].map((level) => {
                    const isActive = difficulty === level;
                    const label = level === "all" ? "Toutes" : level;

                    return (
                        <button
                            key={level}
                            type="button"
                            onClick={() => setDifficulty(level)}
                            className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${
                                isActive
                                    ? "bg-[#1f5e54] text-white"
                                    : "bg-white border border-[#a7cfc1] text-[#1f5e54]"
                            }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            <section className="mb-8">
                <HikesInteractiveMap
                    hikes={filteredHikes}
                    selectedHike={selectedHike}
                    onMarkerClick={handleSelectHike}
                />
            </section>

            <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-[#163c35]">
                    Liste des parcours
                </h2>

                {filteredHikes.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredHikes.map((hike) => {
                            const isSelected = selectedHike?.id === hike.id;

                            return (
                                <article
                                    key={hike.id}
                                    className={`rounded-2xl border bg-white shadow-sm p-4 sm:p-5 transition ${
                                        isSelected
                                            ? "border-[#3f977b] ring-2 ring-[#d7e8e1]"
                                            : "border-slate-200"
                                    }`}
                                >
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                                        {hike.name}
                                    </h3>

                                    <p className="mt-2 text-sm sm:text-base text-slate-700">
                                        {hike.description}
                                    </p>

                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                                        <p><strong>Distance :</strong> {hike.distance} km</p>
                                        <p><strong>Difficulté :</strong> {hike.difficulty}</p>
                                        <p><strong>Durée :</strong> {hike.duration}</p>
                                        <p><strong>Départ :</strong> {hike.startPoint}</p>
                                    </div>

                                    <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleSelectHike(hike)}
                                            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                                                isSelected
                                                    ? "bg-[#1f5e54] text-white"
                                                    : "bg-white border border-[#a7cfc1] text-[#1f5e54] hover:bg-[#d7e8e1]"
                                            }`}
                                        >
                                            {isSelected ? "Trace affichée" : "Voir sur la carte"}
                                        </button>

                                        <Link
                                            to={`/hikes/${hike.id}`}
                                            className="text-[#1f5e54] hover:text-[#3f977b] hover:underline inline-flex items-center text-sm sm:text-base"
                                        >
                                            Voir le détail →
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-600">
                        Aucune randonnée ne correspond à votre recherche.
                    </div>
                )}
            </section>
        </Layout>
    );
}