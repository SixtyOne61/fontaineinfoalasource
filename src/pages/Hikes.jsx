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
    const [selectedHikeId, setSelectedHikeId] = useState(null);

    useEffect(() => {
        getHikes().then((data) => {
            const sorted = [...data].sort((a, b) => a.distance - b.distance);
            setHikes(sorted);
            setSelectedHikeId(sorted[0]?.id ?? null);
        });
    }, []);

    const filteredHikes = useMemo(() => {
        const term = search.toLowerCase();

        return hikes.filter((hike) => {
            const matchesDifficulty = difficulty === "all" || hike.difficulty === difficulty;
            const matchesSearch =
                hike.name?.toLowerCase().includes(term) ||
                hike.description?.toLowerCase().includes(term) ||
                hike.startPoint?.toLowerCase().includes(term);

            return matchesDifficulty && matchesSearch;
        });
    }, [hikes, search, difficulty]);

    const selectedHike = useMemo(() => {
        if (!filteredHikes.length) {
            return null;
        }

        return filteredHikes.find((hike) => hike.id === selectedHikeId) || filteredHikes[0];
    }, [filteredHikes, selectedHikeId]);

    return (
        <Layout>
            <section className="mb-8">
                <h1 className="text-2xl font-bold text-[#163c35] sm:text-3xl">Randonnées</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                    Consultez les parcours disponibles autour de la commune, visualisez leur
                    position sur la carte et affichez directement le tracé d’une randonnée.
                </p>
            </section>

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher une randonnée..."
            />

            <div className="mb-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
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
                                    : "border border-[#a7cfc1] bg-white text-[#1f5e54]"
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
                    onMarkerClick={(hike) => setSelectedHikeId(hike.id)}
                />
            </section>

            <section>
                <h2 className="mb-4 text-xl font-semibold text-[#163c35] sm:text-2xl">
                    Liste des parcours
                </h2>

                {filteredHikes.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredHikes.map((hike) => {
                            const isSelected = selectedHike?.id === hike.id;

                            return (
                                <article
                                    key={hike.id}
                                    className={`rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                                        isSelected
                                            ? "border-[#3f977b] ring-2 ring-[#d7e8e1]"
                                            : "border-slate-200"
                                    }`}
                                >
                                    <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                                        {hike.name}
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-700 sm:text-base">
                                        {hike.description}
                                    </p>

                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                                        <p><strong>Distance :</strong> {hike.distance} km</p>
                                        <p><strong>Difficulté :</strong> {hike.difficulty}</p>
                                        <p><strong>Durée :</strong> {hike.duration}</p>
                                        <p><strong>Départ :</strong> {hike.startPoint}</p>
                                    </div>

                                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedHikeId(hike.id)}
                                            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                                                isSelected
                                                    ? "bg-[#1f5e54] text-white"
                                                    : "border border-[#a7cfc1] bg-white text-[#1f5e54] hover:bg-[#d7e8e1]"
                                            }`}
                                        >
                                            {isSelected ? "Trace affichée" : "Voir sur la carte"}
                                        </button>

                                        <Link
                                            to={`/hikes/${hike.id}`}
                                            className="inline-flex items-center text-sm text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                                        >
                                            Voir le détail →
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">
                        Aucune randonnée ne correspond à votre recherche.
                    </div>
                )}
            </section>
        </Layout>
    );
}
