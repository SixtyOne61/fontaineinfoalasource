import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import HikesMap from "../components/HikesMap";
import { getHikes } from "../data/loader";

export default function Hikes() {
    const [hikes, setHikes] = useState([]);

    useEffect(() => {
        getHikes().then((data) => {
            const sorted = [...data].sort((a, b) => a.distance - b.distance);
            setHikes(sorted);
        });
    }, []);

    return (
        <Layout>
            <section className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Randonnées</h1>
                <p className="mt-2 text-slate-600 max-w-2xl">
                    Consultez les parcours disponibles autour de la commune, visualisez leur
                    position sur la carte et cliquez sur un point pour afficher les détails.
                </p>
            </section>

            <section className="mb-8">
                <HikesMap hikes={hikes} />
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">Liste des parcours</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    {hikes.map((hike) => (
                        <article
                            key={hike.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-slate-900">{hike.name}</h3>
                            <p className="mt-2 text-slate-700">{hike.description}</p>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                                <p><strong>Distance :</strong> {hike.distance} km</p>
                                <p><strong>Difficulté :</strong> {hike.difficulty}</p>
                                <p><strong>Durée :</strong> {hike.duration}</p>
                                <p><strong>Départ :</strong> {hike.startPoint}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </Layout>
    );
}