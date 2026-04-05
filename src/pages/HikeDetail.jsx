import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import CoverImage from "../components/CoverImage";
import HikeTrackMap from "../components/HikeTrackMap";
import { getHikes } from "../data/loader";

export default function HikeDetail() {
    const { id } = useParams();
    const [hike, setHike] = useState(null);

    useEffect(() => {
        getHikes().then((data) => {
            const found = data.find((item) => String(item.id) === String(id));
            setHike(found || null);
        });
    }, [id]);

    if (!hike) {
        return (
            <Layout>
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Randonnée introuvable
                    </h1>
                    <p className="text-slate-600 mb-4">
                        La randonnée demandée n’existe pas ou n’est plus disponible.
                    </p>
                    <Link to="/hikes" className="text-[#1f5e54] hover:underline">
                        Retour à la liste des randonnées
                    </Link>
                </div>
            </Layout>
        );
    }

    const googleMapsUrl = `https://www.google.com/maps?q=${hike.lat},${hike.lng}`;
    const osmUrl = `https://www.openstreetmap.org/?mlat=${hike.lat}&mlon=${hike.lng}#map=15/${hike.lat}/${hike.lng}`;

    return (
        <Layout>
            <article className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <CoverImage
                        src={hike.image}
                        alt={hike.name}
                        className="h-72 w-full object-cover"
                    />

                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">{hike.name}</h1>
                        <p className="text-slate-700 mb-6">{hike.description}</p>

                        <div className="grid gap-4 sm:grid-cols-2 mb-8">
                            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                                <p className="text-sm text-slate-500">Distance</p>
                                <p className="font-medium text-slate-900">{hike.distance} km</p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                                <p className="text-sm text-slate-500">Difficulté</p>
                                <p className="font-medium text-slate-900">{hike.difficulty}</p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                                <p className="text-sm text-slate-500">Durée</p>
                                <p className="font-medium text-slate-900">{hike.duration}</p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                                <p className="text-sm text-slate-500">Départ</p>
                                <p className="font-medium text-slate-900">{hike.startPoint}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                            >
                                Ouvrir dans Google Maps
                            </a>
                            <a
                                href={osmUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                            >
                                Ouvrir dans OpenStreetMap
                            </a>
                            {hike.gpx && (
                                <a
                                    href={hike.gpx}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                                >
                                    Télécharger le fichier GPX
                                </a>
                            )}
                        </div>

                        <div className="mt-8">
                            <Link to="/hikes" className="text-[#1f5e54] hover:underline">
                                ← Retour aux randonnées
                            </Link>
                        </div>
                    </div>
                </div>

                <HikeTrackMap hike={hike} />
            </article>
        </Layout>
    );
}