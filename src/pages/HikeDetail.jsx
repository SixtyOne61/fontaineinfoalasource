import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ElevationChart from "../components/ElevationChart";
import HikeTrackMap from "../components/HikeTrackMap";
import Layout from "../components/Layout";
import { getHikes } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";
import { loadGpxTrackData } from "../utils/gpx";
import { hasValidCoordinates } from "../utils/security";

const EMPTY_ELEVATION_DATA = {
    elevationProfile: [],
    minElevation: null,
    maxElevation: null
};

export default function HikeDetail() {
    const { id } = useParams();
    const { lang, t } = useLocale();
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
                    maxElevation: data.maxElevation
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
                    <h1 className="mb-2 text-3xl text-slate-900">{lang === "en" ? "Walk not found" : "Balade introuvable"}</h1>
                    <p className="mb-4 text-slate-600">
                        {lang === "en" ? "This route is no longer available." : "Ce parcours n'est plus disponible."}
                    </p>
                    <Link to="/hikes" className="text-[#1f5e54] hover:underline">
                        {lang === "en" ? "Back to walks" : "Retour aux balades"}
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
                        <p className="section-kicker mb-2">{lang === "en" ? "Route" : "Parcours"}</p>
                        <h1 className="mb-4 text-3xl text-slate-900 sm:text-4xl">
                            {getLocalizedField(hike, "name", lang)}
                        </h1>

                        <p className="mb-6 text-sm text-slate-700 sm:text-base">
                            {getLocalizedField(hike, "description", lang)}
                        </p>

                        <div className="mb-8 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">{lang === "en" ? "Distance" : "Distance"}</p>
                                <p className="font-medium text-slate-900">{hike.distance} km</p>
                            </div>

                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">{lang === "en" ? "Difficulty" : "Difficulté"}</p>
                                <p className="font-medium text-slate-900">{getLocalizedField(hike, "difficulty", lang)}</p>
                            </div>

                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">{lang === "en" ? "Duration" : "Durée"}</p>
                                <p className="font-medium text-slate-900">{getLocalizedField(hike, "duration", lang)}</p>
                            </div>

                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">{lang === "en" ? "Start point" : "Départ"}</p>
                                <p className="font-medium text-slate-900">{getLocalizedField(hike, "startPoint", lang)}</p>
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
                                    {lang === "en" ? "Open in Google Maps" : "Ouvrir dans Google Maps"}
                                </a>
                            )}

                            {osmUrl && (
                                <a
                                    href={osmUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                                >
                                    {lang === "en" ? "Open in OpenStreetMap" : "Ouvrir dans OpenStreetMap"}
                                </a>
                            )}

                            {hike.gpx && (
                                <a
                                    href={hike.gpx}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                                >
                                    {lang === "en" ? "Download GPX file" : "Télécharger le fichier GPX"}
                                </a>
                            )}
                        </div>

                        <div className="mt-8">
                            <Link to="/hikes" className="text-[#1f5e54] hover:underline">
                                {t("common.backToHikes")}
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
