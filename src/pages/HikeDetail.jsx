import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import HikeTrackMap from "../components/HikeTrackMap";
import ElevationChart from "../components/ElevationChart";
import { getHikes } from "../data/loader";
import { loadGpxTrackData } from "../utils/gpx";
import { hasValidCoordinates } from "../utils/security";

const EMPTY_ELEVATION_DATA = {
    elevationProfile: [],
    minElevation: null,
    maxElevation: null,
};

export default function HikeDetail() {
    const { id } = useParams();
    const [hike, setHike] = useState(null);
    const [elevationData, setElevationData] = useState(EMPTY_ELEVATION_DATA);

    useEffect(() => {
        getHikes().then((data) => {
            const found = data.find((item) => String(item.id) === String(id));
            setHike(found || null);
        });
    }, [id]);

    useEffect(() => {
        let isMounted = true;

        async function syncElevationData() {
            if (!hike?.gpx) {
                setElevationData(EMPTY_ELEVATION_DATA);
                return;
            }

            const data = await loadGpxTrackData(hike.gpx);

            if (isMounted) {
                setElevationData({
                    elevationProfile: data.elevationProfile,
                    minElevation: data.minElevation,
                    maxElevation: data.maxElevation,
                });
            }
        }

        syncElevationData();

        return () => {
            isMounted = false;
        };
    }, [hike]);

    if (!hike) {
        return (
            <Layout>
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-8">
                    <h1 className="mb-2 text-3xl text-slate-900">Randonnée introuvable</h1>
                    <p className="mb-4 text-slate-600">
                        La randonnée demandée n’existe pas ou n’est plus disponible.
                    </p>
                    <Link to="/hikes" className="text-[#1f5e54] hover:underline">
                        Retour à la liste des randonnées
                    </Link>
                </div>
            </Layout>
        );
    }

    const hasCoordinates = hasValidCoordinates(hike);
    const googleMapsUrl = hasCoordinates
        ? `https://www.google.com/maps?q=${hike.lat},${hike.lng}`
        : null;
    const osmUrl = hasCoordinates
        ? `https://www.openstreetmap.org/?mlat=${hike.lat}&mlon=${hike.lng}#map=15/${hike.lat}/${hike.lng}`
        : null;

    return (
        <Layout>
            <div className="grid gap-6 sm:gap-8">
                <article className="grid gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-8">
                        <p className="section-kicker mb-2">Parcours</p>
                        <h1 className="mb-4 text-3xl text-slate-900 sm:text-4xl">
                            {hike.name}
                        </h1>

                        <p className="mb-6 text-sm text-slate-700 sm:text-base">
                            {hike.description}
                        </p>

                        <div className="mb-8 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Distance</p>
                                <p className="font-medium text-slate-900">{hike.distance} km</p>
                            </div>

                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Difficulté</p>
                                <p className="font-medium text-slate-900">{hike.difficulty}</p>
                            </div>

                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Durée</p>
                                <p className="font-medium text-slate-900">{hike.duration}</p>
                            </div>

                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Départ</p>
                                <p className="font-medium text-slate-900">{hike.startPoint}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 text-sm sm:text-base">
                            {googleMapsUrl && (
                                <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                                >
                                    Ouvrir dans Google Maps
                                </a>
                            )}

                            {osmUrl && (
                                <a
                                    href={osmUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                                >
                                    Ouvrir dans OpenStreetMap
                                </a>
                            )}

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

                    <HikeTrackMap hike={hike} />
                </article>

                <ElevationChart
                    profile={elevationData.elevationProfile}
                    minElevation={elevationData.minElevation}
                    maxElevation={elevationData.maxElevation}
                />
            </div>
        </Layout>
    );
}
