import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import HikesMap from "../components/HikesMap";
import SearchBar from "../components/SearchBar";
import CoverImage from "../components/CoverImage";
import { getHikes } from "../data/loader";

export default function Hikes() {
    const [hikes, setHikes] = useState([]);
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("all");

    useEffect(() => {
        getHikes().then((data) => {
            const sorted = [...data].sort((a, b) => a.distance - b.distance);
            setHikes(sorted);
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

    return (
        <Layout>
            <section className="mb-8">
                <h1 className="text-3xl font-bold text-[#163c35]">Randonnées</h1>
                <p className="mt-2 text-slate-600 max-w-2xl">
                    Consultez les parcours disponibles autour de la commune, visualisez leur
                    position sur la carte et cliquez sur un point pour afficher les détails.
                </p>
            </section>

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher une randonnée..."
            />

            <div className="mb-6 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => setDifficulty("all")}
                    className={`rounded-xl px-4 py-2 ${
                        difficulty === "all"
                            ? "bg-[#1f5e54] text-white"
                            : "bg-white border border-[#a7cfc1] text-[#1f5e54]"
                    }`}
                >
                    Toutes
                </button>

                <button
                    type="button"
                    onClick={() => setDifficulty("Facile")}
                    className={`rounded-xl px-4 py-2 ${
                        difficulty === "Facile"
                            ? "bg-[#1f5e54] text-white"
                            : "bg-white border border-[#a7cfc1] text-[#1f5e54]"
                    }`}
                >
                    Facile
                </button>

                <button
                    type="button"
                    onClick={() => setDifficulty("Moyen")}
                    className={`rounded-xl px-4 py-2 ${
                        difficulty === "Moyen"
                            ? "bg-[#1f5e54] text-white"
                            : "bg-white border border-[#a7cfc1] text-[#1f5e54]"
                    }`}
                >
                    Moyen
                </button>

                <button
                    type="button"
                    onClick={() => setDifficulty("Difficile")}
                    className={`rounded-xl px-4 py-2 ${
                        difficulty === "Difficile"
                            ? "bg-[#1f5e54] text-white"
                            : "bg-white border border-[#a7cfc1] text-[#1f5e54]"
                    }`}
                >
                    Difficile
                </button>
            </div>

            <section className="mb-8">
                <HikesMap hikes={filteredHikes} />
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 text-[#163c35]">Liste des parcours</h2>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredHikes.length > 0 ? (
                        filteredHikes.map((hike) => (
                            <article
                                key={hike.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                                <CoverImage
                                    src={hike.image}
                                    alt={hike.name}
                                    className="h-48 w-full object-cover"
                                />

                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-slate-900">{hike.name}</h3>
                                    <p className="mt-2 text-slate-700">{hike.description}</p>

                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                                        <p><strong>Distance :</strong> {hike.distance} km</p>
                                        <p><strong>Difficulté :</strong> {hike.difficulty}</p>
                                        <p><strong>Durée :</strong> {hike.duration}</p>
                                        <p><strong>Départ :</strong> {hike.startPoint}</p>
                                    </div>

                                    <Link
                                        to={`/hikes/${hike.id}`}
                                        className="text-[#1f5e54] hover:text-[#3f977b] hover:underline mt-4 inline-block"
                                    >
                                        Voir le détail →
                                    </Link>
                                </div>
                            </article>
                        ))
                    ) : (
                        <p className="text-slate-600">
                            Aucune randonnée ne correspond à votre recherche.
                        </p>
                    )}
                </div>
            </section>
        </Layout>
    );
}