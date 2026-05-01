import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HikesInteractiveMap from "../components/HikesInteractiveMap";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import { getHikes } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";

const difficultyFilters = {
    fr: [
        { key: "all", label: "Tous niveaux" },
        { key: "Facile", label: "Facile" },
        { key: "Moyen", label: "Moyen" },
        { key: "Difficile", label: "Difficile" }
    ],
    en: [
        { key: "all", label: "All levels" },
        { key: "Easy", label: "Easy" },
        { key: "Moderate", label: "Moderate" },
        { key: "Hard", label: "Hard" }
    ]
};

const durationFilters = {
    fr: [
        { key: "all", label: "Toutes durées" },
        { key: "quick", label: "Moins de 1 h 30" },
        { key: "halfDay", label: "Jusqu'à 3 h" },
        { key: "long", label: "Plus de 3 h" }
    ],
    en: [
        { key: "all", label: "All durations" },
        { key: "quick", label: "Under 1 h 30" },
        { key: "halfDay", label: "Up to 3 h" },
        { key: "long", label: "More than 3 h" }
    ]
};

const intentFilters = {
    fr: [
        { key: "all", label: "Toutes les envies" },
        { key: "family", label: "Sortie facile" },
        { key: "fresh", label: "Fraicheur" },
        { key: "views", label: "Beaux points de vue" },
        { key: "sport", label: "Marche plus soutenue" }
    ],
    en: [
        { key: "all", label: "All outing types" },
        { key: "family", label: "Easy outing" },
        { key: "fresh", label: "Cooler route" },
        { key: "views", label: "Scenic views" },
        { key: "sport", label: "More demanding walk" }
    ]
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

function matchesDuration(hike, durationFilter) {
    const totalMinutes = parseDurationMinutes(hike.duration);

    if (durationFilter === "quick") return totalMinutes > 0 && totalMinutes <= 90;
    if (durationFilter === "halfDay") return totalMinutes > 0 && totalMinutes <= 180;
    if (durationFilter === "long") return totalMinutes > 180;

    return true;
}

function getHikeSignals(hike, lang) {
    const description = getLocalizedField(hike, "description", lang).toLowerCase();
    const difficulty = getLocalizedField(hike, "difficulty", lang);
    const durationText = getLocalizedField(hike, "duration", lang);
    const minutes = parseDurationMinutes(hike.duration);
    const isEasy = difficulty === "Easy" || difficulty === "Facile";
    const isModerate = difficulty === "Moderate" || difficulty === "Moyen";
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
    const bestFor = lang === "en"
        ? isEasy
            ? "an easy outing without rushing"
            : isHard
                ? "walkers used to longer efforts"
                : "a half-day outing with a bit more effort"
        : isEasy
            ? "une sortie simple, sans se presser"
            : isHard
                ? "des marcheurs deja a l'aise sur des efforts plus longs"
                : "une demi-journee de marche avec un peu plus d'effort";
    const pace = lang === "en"
        ? minutes <= 90
            ? "Easy to fit into a short visit"
            : minutes <= 180
                ? "Best planned over a half day"
                : "Set aside a longer outing window"
        : minutes <= 90
            ? "Facile a caser dans une visite courte"
            : minutes <= 180
                ? "A prevoir sur une demi-journee"
                : "A reserver pour une sortie plus longue";
    const signalTags = [];

    if (isEasy) {
        signalTags.push(lang === "en" ? "Easy route" : "Parcours facile");
    }

    if (hasFreshCue) {
        signalTags.push(lang === "en" ? "Cooler atmosphere" : "Ambiance plus fraiche");
    }

    if (hasViewCue) {
        signalTags.push(lang === "en" ? "Scenic views" : "Beaux points de vue");
    }

    if ((isModerate || isHard) && !hasViewCue) {
        signalTags.push(lang === "en" ? "More active walk" : "Marche plus soutenue");
    }

    if (minutes > 180) {
        signalTags.push(lang === "en" ? "Longer outing" : "Sortie plus longue");
    }

    return {
        bestFor,
        hasFreshCue,
        hasViewCue,
        isEasy,
        isHard,
        minutes,
        pace,
        signalTags: signalTags.slice(0, 3),
        durationText
    };
}

function matchesIntent(signals, intentFilter) {
    if (intentFilter === "family") return signals.isEasy;
    if (intentFilter === "fresh") return signals.hasFreshCue;
    if (intentFilter === "views") return signals.hasViewCue;
    if (intentFilter === "sport") return signals.isHard || (!signals.isEasy && signals.minutes >= 150);

    return true;
}

export default function Hikes() {
    const { lang, t } = useLocale();
    const [hikes, setHikes] = useState([]);
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("all");
    const [durationFilter, setDurationFilter] = useState("all");
    const [intentFilter, setIntentFilter] = useState("all");
    const [selectedHikeId, setSelectedHikeId] = useState(null);

    useEffect(() => {
        getHikes().then((data) => {
            const sorted = [...data].sort((a, b) => parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration));
            setHikes(sorted);
            setSelectedHikeId(sorted[0]?.id ?? null);
        });
    }, []);

    const filteredHikes = useMemo(() => {
        const term = search.toLowerCase().trim();

        return hikes.filter((hike) => {
            const localizedDifficulty = getLocalizedField(hike, "difficulty", lang);
            const localizedName = getLocalizedField(hike, "name", lang);
            const localizedDescription = getLocalizedField(hike, "description", lang);
            const localizedStartPoint = getLocalizedField(hike, "startPoint", lang);
            const signals = getHikeSignals(hike, lang);
            const matchesDifficulty = difficulty === "all" || localizedDifficulty === difficulty;
            const matchesSearch =
                !term ||
                localizedName.toLowerCase().includes(term) ||
                localizedDescription.toLowerCase().includes(term) ||
                localizedStartPoint.toLowerCase().includes(term);

            return (
                matchesDifficulty &&
                matchesSearch &&
                matchesDuration(hike, durationFilter) &&
                matchesIntent(signals, intentFilter)
            );
        });
    }, [difficulty, durationFilter, hikes, intentFilter, lang, search]);

    const selectedHike = useMemo(() => {
        if (!filteredHikes.length) {
            return null;
        }

        return filteredHikes.find((hike) => hike.id === selectedHikeId) || filteredHikes[0];
    }, [filteredHikes, selectedHikeId]);

    const stats = useMemo(() => {
        const shortCount = hikes.filter((hike) => parseDurationMinutes(hike.duration) <= 90).length;
        const easyCount = hikes.filter((hike) => {
            const level = getLocalizedField(hike, "difficulty", lang);
            return level === "Easy" || level === "Facile";
        }).length;
        const scenicCount = hikes.filter((hike) => getHikeSignals(hike, lang).hasViewCue).length;

        return { easyCount, scenicCount, shortCount };
    }, [hikes, lang]);

    return (
        <Layout>
            <section className="mb-8">
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                    <p className="section-kicker">{lang === "en" ? "Nature and discovery" : "Nature et decouverte"}</p>
                    <h1 className="mt-2 text-3xl text-[#163c35] sm:text-4xl">
                        {lang === "en" ? "Walks and hikes" : "Balades et randonnees"}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                        {lang === "en"
                            ? "Choose a route by available time, walking level and outing style, then display it directly on the map."
                            : "Choisissez un parcours selon votre temps, votre niveau et votre envie du moment, puis affichez-le directement sur la carte."}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[1.35rem] bg-[#eef7f3] p-4">
                            <p className="text-sm text-[#1f5e54]">{lang === "en" ? "Short outings" : "Sorties courtes"}</p>
                            <p className="mt-1 text-2xl text-[#163c35]">{stats.shortCount}</p>
                            <p className="text-sm text-slate-600">
                                {lang === "en" ? "easy to fit into a visit" : "faciles a integrer dans une visite"}
                            </p>
                        </div>

                        <div className="rounded-[1.35rem] bg-slate-50 p-4">
                            <p className="text-sm text-slate-600">{lang === "en" ? "Easy routes" : "Parcours faciles"}</p>
                            <p className="mt-1 text-2xl text-slate-900">{stats.easyCount}</p>
                            <p className="text-sm text-slate-600">
                                {lang === "en" ? "for a calmer outing" : "pour une marche sans stress"}
                            </p>
                        </div>

                        <div className="rounded-[1.35rem] bg-slate-50 p-4">
                            <p className="text-sm text-slate-600">{lang === "en" ? "Scenic routes" : "Parcours panoramiques"}</p>
                            <p className="mt-1 text-2xl text-slate-900">{stats.scenicCount}</p>
                            <p className="text-sm text-slate-600">
                                {lang === "en" ? "with viewpoints to spot quickly" : "avec points de vue reperables rapidement"}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="surface-card mb-6 rounded-[1.75rem] border border-white/70 p-4 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder={lang === "en" ? "Search by route, start point or atmosphere..." : "Rechercher un parcours, un depart ou une ambiance..."}
                />

                <div className="mt-4">
                    <p className="mb-3 text-sm font-medium text-slate-700">
                        {lang === "en" ? "Choose your outing style" : "Choisissez votre envie"}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {intentFilters[lang].map((filter) => {
                            const isActive = intentFilter === filter.key;

                            return (
                                <button
                                    key={filter.key}
                                    type="button"
                                    onClick={() => setIntentFilter(filter.key)}
                                    className={`rounded-full px-4 py-2 text-sm ${
                                        isActive
                                            ? "bg-[#163c35] text-white"
                                            : "border border-slate-300 bg-white text-slate-700"
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div>
                        <p className="mb-3 text-sm font-medium text-slate-700">
                            {lang === "en" ? "Time available" : "Temps disponible"}
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {durationFilters[lang].map((filter) => {
                                const isActive = durationFilter === filter.key;

                                return (
                                    <button
                                        key={filter.key}
                                        type="button"
                                        onClick={() => setDurationFilter(filter.key)}
                                        className={`rounded-full px-4 py-2 text-sm ${
                                            isActive
                                                ? "bg-[#163c35] text-white"
                                                : "border border-slate-300 bg-white text-slate-700"
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <p className="mb-3 text-sm font-medium text-slate-700">
                            {lang === "en" ? "Walking level" : "Niveau de marche"}
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {difficultyFilters[lang].map((level) => {
                                const isActive = difficulty === level.key;

                                return (
                                    <button
                                        key={level.key}
                                        type="button"
                                        onClick={() => setDifficulty(level.key)}
                                        className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${
                                            isActive
                                                ? "bg-[#1f5e54] text-white"
                                                : "border border-[#a7cfc1] bg-white text-[#1f5e54]"
                                        }`}
                                    >
                                        {level.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <section className="mb-8">
                <HikesInteractiveMap
                    hikes={filteredHikes}
                    selectedHike={selectedHike}
                    onMarkerClick={(hike) => setSelectedHikeId(hike.id)}
                />
            </section>

            <section>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-2xl text-[#163c35] sm:text-3xl">
                            {lang === "en" ? "Routes to compare" : "Parcours a comparer"}
                        </h2>
                        <p className="text-sm text-slate-600 sm:text-base">
                            {lang === "en"
                                ? `${filteredHikes.length} route${filteredHikes.length > 1 ? "s" : ""} match your filters.`
                                : `${filteredHikes.length} parcours correspondent a vos filtres.`}
                        </p>
                    </div>
                </div>

                {filteredHikes.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredHikes.map((hike) => {
                            const isSelected = selectedHike?.id === hike.id;
                            const signals = getHikeSignals(hike, lang);

                            return (
                                <article
                                    key={hike.id}
                                    className={`surface-card rounded-[1.75rem] border p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] transition ${
                                        isSelected
                                            ? "border-[#3f977b] ring-2 ring-[#d7e8e1]"
                                            : "border-white/70"
                                    }`}
                                >
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                            {getLocalizedField(hike, "difficulty", lang)}
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                            {signals.durationText}
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                            {hike.distance} km
                                        </span>
                                    </div>

                                    <h3 className="text-2xl text-slate-900">{getLocalizedField(hike, "name", lang)}</h3>

                                    <p className="mt-2 text-sm text-slate-700 sm:text-base">
                                        {getLocalizedField(hike, "description", lang)}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {signals.signalTags.map((tag) => (
                                            <span
                                                key={`${hike.id}-${tag}`}
                                                className="rounded-full border border-[#d7e8e1] bg-white px-3 py-1 text-xs font-medium text-[#1f5e54]"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-4 rounded-[1.35rem] bg-slate-50 p-4 text-sm text-slate-600">
                                        <p>
                                            <strong>{lang === "en" ? "Start point:" : "Depart :"}</strong>{" "}
                                            {getLocalizedField(hike, "startPoint", lang)}
                                        </p>
                                        <p className="mt-2">
                                            <strong>{lang === "en" ? "Best for:" : "Bon choix pour :"}</strong>{" "}
                                            {signals.bestFor}
                                        </p>
                                        <p className="mt-2">
                                            <strong>{lang === "en" ? "Pace:" : "Rythme :"}</strong> {signals.pace}
                                        </p>
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
                                            {lang === "en"
                                                ? isSelected ? "Route shown on map" : "Show on map"
                                                : isSelected ? "Parcours affiche sur la carte" : "Voir sur la carte"}
                                        </button>

                                        <Link
                                            to={`/hikes/${hike.id}`}
                                            className="inline-flex items-center text-sm text-[#1f5e54] hover:text-[#3f977b] hover:underline sm:text-base"
                                        >
                                            {t("common.viewDetails")}
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="surface-card rounded-[1.75rem] border border-white/70 p-5 text-slate-600 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                        <p>{lang === "en" ? "No route matches your current filters." : "Aucun parcours ne correspond a vos filtres actuels."}</p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setDifficulty("all");
                                setDurationFilter("all");
                                setIntentFilter("all");
                            }}
                            className="mt-3 text-sm font-medium text-[#1f5e54] hover:underline"
                        >
                            {lang === "en" ? "Clear filters" : "Reinitialiser les filtres"}
                        </button>
                    </div>
                )}
            </section>
        </Layout>
    );
}
