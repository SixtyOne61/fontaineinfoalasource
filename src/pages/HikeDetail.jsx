import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AsyncStateCard from "../components/AsyncStateCard";
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

function parseDurationMinutes(duration) {
    const value = String(duration || "").trim();
    const match = value.match(/(\d+)\s*h\s*(\d+)?/i);

    if (match) {
        return Number(match[1]) * 60 + Number(match[2] || 0);
    }

    const numeric = Number.parseInt(value, 10);
    return Number.isFinite(numeric) ? numeric : 0;
}

function getHikeSignals(hike, lang) {
    const difficulty = getLocalizedField(hike, "difficulty", lang);
    const description = getLocalizedField(hike, "description", lang).toLowerCase();
    const minutes = parseDurationMinutes(hike.duration);
    const isEasy = difficulty === "Easy" || difficulty === "Facile";
    const isHard = difficulty === "Hard" || difficulty === "Difficile";
    const hasFreshCue =
        description.includes("fraich") ||
        description.includes("sorgue") ||
        description.includes("cool") ||
        description.includes("shade") ||
        description.includes("ombre");
    const hasViewCue =
        description.includes("vue") ||
        description.includes("view") ||
        description.includes("panorama") ||
        description.includes("belved");
    const practicalTips = [];
    const bestFor = [];

    if (lang === "en") {
        if (isEasy) {
            bestFor.push("a calm outing");
            practicalTips.push("Good choice if you want a simple route without committing a full day.");
        } else if (isHard) {
            bestFor.push("walkers already comfortable on longer efforts");
            practicalTips.push("Plan more time and keep water with you for the more sustained sections.");
        } else {
            bestFor.push("a half-day walk with a bit more effort");
            practicalTips.push("Allow enough time to walk comfortably and stop at viewpoints.");
        }

        if (hasFreshCue) {
            bestFor.push("a cooler atmosphere near water or shade");
        }

        if (hasViewCue) {
            bestFor.push("open viewpoints over the site");
        }

        if (minutes <= 90) {
            practicalTips.push("Easy to fit into a short stay or before another visit.");
        } else if (minutes > 180) {
            practicalTips.push("Better suited to a dedicated outing rather than a quick stop.");
        }
    } else {
        if (isEasy) {
            bestFor.push("une sortie calme");
            practicalTips.push("Bon choix si vous voulez un parcours simple sans y consacrer toute la journee.");
        } else if (isHard) {
            bestFor.push("des marcheurs deja a l'aise sur un effort plus long");
            practicalTips.push("Prevoir plus de temps et de l'eau pour les passages plus soutenus.");
        } else {
            bestFor.push("une demi-journee de marche avec un peu plus d'effort");
            practicalTips.push("Gardez une marge confortable pour marcher et faire des pauses aux points de vue.");
        }

        if (hasFreshCue) {
            bestFor.push("une ambiance plus fraiche au bord de l'eau ou a l'ombre");
        }

        if (hasViewCue) {
            bestFor.push("de belles vues sur le site");
        }

        if (minutes <= 90) {
            practicalTips.push("Facile a integrer dans une visite courte ou avant une autre activite.");
        } else if (minutes > 180) {
            practicalTips.push("Mieux vaut le prevoir comme vraie sortie plutot que comme simple detour.");
        }
    }

    return {
        bestFor,
        hasFreshCue,
        hasViewCue,
        minutes,
        practicalTips
    };
}

export default function HikeDetail() {
    const { id } = useParams();
    const { lang, t } = useLocale();
    const [hike, setHike] = useState(null);
    const [relatedHikes, setRelatedHikes] = useState([]);
    const [status, setStatus] = useState("loading");
    const [elevationData, setElevationData] = useState(EMPTY_ELEVATION_DATA);

    useEffect(() => {
        let isMounted = true;

        async function syncHike() {
            try {
                setStatus("loading");
                const data = await getHikes();
                const found = data.find((item) => String(item.id) === String(id));

                if (!isMounted) return;

                setHike(found || null);
                setRelatedHikes(
                    data
                        .filter((item) => String(item.id) !== String(id))
                        .sort((a, b) => Math.abs(a.distance - (found?.distance ?? 0)) - Math.abs(b.distance - (found?.distance ?? 0)))
                        .slice(0, 2)
                );
                setStatus(found ? "ready" : "notFound");
            } catch (error) {
                console.error("Unable to load hike detail:", error);

                if (isMounted) {
                    setHike(null);
                    setRelatedHikes([]);
                    setStatus("error");
                }
            }
        }

        syncHike();

        return () => {
            isMounted = false;
        };
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

    const signals = useMemo(() => (hike ? getHikeSignals(hike, lang) : null), [hike, lang]);

    if (status === "loading") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Loading walk" : "Chargement de la balade"}
                description={lang === "en" ? "The route details are being prepared." : "Les details du parcours sont en cours de chargement."}
                linkTo="/hikes"
                linkLabel={lang === "en" ? "Back to walks" : "Retour aux balades"}
            />
        );
    }

    if (status === "error") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Unable to load walk" : "Chargement impossible"}
                description={lang === "en" ? "The route details cannot be displayed right now." : "Les details du parcours ne peuvent pas etre affiches pour le moment."}
                linkTo="/hikes"
                linkLabel={lang === "en" ? "Back to walks" : "Retour aux balades"}
            />
        );
    }

    if (status === "notFound" || !hike || !signals) {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Walk not found" : "Balade introuvable"}
                description={lang === "en" ? "This route is no longer available." : "Ce parcours n est plus disponible."}
                linkTo="/hikes"
                linkLabel={lang === "en" ? "Back to walks" : "Retour aux balades"}
            />
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

                        <div className="mb-6 flex flex-wrap gap-2">
                            {signals.hasFreshCue && (
                                <span className="rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                    {lang === "en" ? "Cooler atmosphere" : "Ambiance plus fraiche"}
                                </span>
                            )}
                            {signals.hasViewCue && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    {lang === "en" ? "Viewpoints" : "Points de vue"}
                                </span>
                            )}
                            {signals.minutes <= 90 && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    {lang === "en" ? "Short outing" : "Sortie courte"}
                                </span>
                            )}
                        </div>

                        <div className="mb-8 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">{lang === "en" ? "Distance" : "Distance"}</p>
                                <p className="font-medium text-slate-900">{hike.distance} km</p>
                            </div>

                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">{lang === "en" ? "Difficulty" : "Difficulte"}</p>
                                <p className="font-medium text-slate-900">{getLocalizedField(hike, "difficulty", lang)}</p>
                            </div>

                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">{lang === "en" ? "Duration" : "Duree"}</p>
                                <p className="font-medium text-slate-900">{getLocalizedField(hike, "duration", lang)}</p>
                            </div>

                            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">{lang === "en" ? "Start point" : "Depart"}</p>
                                <p className="font-medium text-slate-900">{getLocalizedField(hike, "startPoint", lang)}</p>
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div className="rounded-[1.35rem] bg-[#eef7f3] p-4">
                                <p className="text-sm font-medium text-[#1f5e54]">
                                    {lang === "en" ? "Good choice if you want..." : "Bon choix si vous cherchez..."}
                                </p>
                                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                                    {signals.bestFor.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-[1.35rem] bg-slate-50 p-4">
                                <p className="text-sm font-medium text-slate-700">
                                    {lang === "en" ? "To plan before leaving" : "A prevoir avant de partir"}
                                </p>
                                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                                    {signals.practicalTips.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                    <li>
                                        {lang === "en"
                                            ? `Start from ${getLocalizedField(hike, "startPoint", lang)}.`
                                            : `Depart depuis ${getLocalizedField(hike, "startPoint", lang)}.`}
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-2 text-sm sm:text-base">
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
                                    {lang === "en" ? "Download GPX file" : "Telecharger le fichier GPX"}
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

                {relatedHikes.length > 0 && (
                    <section className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                        <div className="mb-4">
                            <p className="section-kicker">{lang === "en" ? "Other ideas" : "Autres idees"}</p>
                            <h2 className="mt-2 text-2xl text-slate-900">
                                {lang === "en" ? "Compare with another route" : "Comparer avec un autre parcours"}
                            </h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {relatedHikes.map((item) => (
                                <article key={item.id} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                    <div className="mb-2 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                            {getLocalizedField(item, "difficulty", lang)}
                                        </span>
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                            {getLocalizedField(item, "duration", lang)}
                                        </span>
                                    </div>

                                    <h3 className="text-xl text-slate-900">{getLocalizedField(item, "name", lang)}</h3>
                                    <p className="mt-2 text-sm text-slate-700">{getLocalizedField(item, "description", lang)}</p>

                                    <Link
                                        to={`/hikes/${item.id}`}
                                        className="mt-4 inline-flex text-sm font-medium text-[#1f5e54] hover:underline"
                                    >
                                        {lang === "en" ? "View this route" : "Voir ce parcours"}
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </Layout>
    );
}
