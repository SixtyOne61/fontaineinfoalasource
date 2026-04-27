import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HikesInteractiveMap from "../components/HikesInteractiveMap";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import { getHikes } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";

const durationFilters = {
    fr: [
        { key: "all", label: "Toutes" },
        { key: "short", label: "Moins de 3 h" }
    ],
    en: [
        { key: "all", label: "All" },
        { key: "short", label: "Under 3 h" }
    ]
};

function matchesDuration(hike, durationFilter) {
    if (durationFilter !== "short") return true;
    const [hours = "0", minutes = "0"] = String(hike.duration).split("h");
    const totalMinutes = Number(hours) * 60 + Number(minutes || 0);
    return totalMinutes > 0 && totalMinutes <= 180;
}

export default function Hikes() {
    const { lang, t } = useLocale();
    const [hikes, setHikes] = useState([]);
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("all");
    const [durationFilter, setDurationFilter] = useState("all");
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
            const matchesDifficulty = difficulty === "all" || getLocalizedField(hike, "difficulty", lang) === difficulty;
            const matchesSearch =
                getLocalizedField(hike, "name", lang).toLowerCase().includes(term) ||
                getLocalizedField(hike, "description", lang).toLowerCase().includes(term) ||
                getLocalizedField(hike, "startPoint", lang).toLowerCase().includes(term);

            return matchesDifficulty && matchesSearch && matchesDuration(hike, durationFilter);
        });
    }, [difficulty, durationFilter, hikes, lang, search]);

    const selectedHike = useMemo(() => {
        if (!filteredHikes.length) {
            return null;
        }

        return filteredHikes.find((hike) => hike.id === selectedHikeId) || filteredHikes[0];
    }, [filteredHikes, selectedHikeId]);

    return (
        <Layout>
            <section className="mb-8">
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                    <p className="section-kicker">{lang === "en" ? "Nature and discovery" : "Nature et découverte"}</p>
                    <h1 className="mt-2 text-3xl text-[#163c35] sm:text-4xl">{lang === "en" ? "Walks" : "Balades et randonnées"}</h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                        {lang === "en"
                            ? "Compare nearby routes, display their track and choose an outing that suits your pace."
                            : "Comparez les parcours autour du village, affichez leur tracé et choisissez une sortie adaptée à votre rythme."}
                    </p>
                </div>
            </section>

            <div className="surface-card mb-6 rounded-[1.75rem] border border-white/70 p-4 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder={lang === "en" ? "Search a walk or a starting point..." : "Rechercher une balade ou un point de départ..."}
                />

                <div className="mb-3 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                    {[
                        { fr: "Toutes", en: "All", value: "all" },
                        { fr: "Facile", en: "Easy", value: lang === "en" ? "Easy" : "Facile" },
                        { fr: "Moyen", en: "Moderate", value: lang === "en" ? "Moderate" : "Moyen" },
                        { fr: "Difficile", en: "Hard", value: lang === "en" ? "Hard" : "Difficile" }
                    ].map((level) => {
                        const isActive = difficulty === level.value;

                        return (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => setDifficulty(level.value)}
                                className={`rounded-xl px-4 py-2.5 text-sm sm:text-base ${
                                    isActive
                                        ? "bg-[#1f5e54] text-white"
                                        : "border border-[#a7cfc1] bg-white text-[#1f5e54]"
                                }`}
                            >
                                {lang === "en" ? level.en : level.fr}
                            </button>
                        );
                    })}
                </div>

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

            <section className="mb-8">
                <HikesInteractiveMap
                    hikes={filteredHikes}
                    selectedHike={selectedHike}
                    onMarkerClick={(hike) => setSelectedHikeId(hike.id)}
                />
            </section>

            <section>
                <h2 className="mb-4 text-2xl text-[#163c35] sm:text-3xl">{lang === "en" ? "Suggested routes" : "Parcours à explorer"}</h2>

                {filteredHikes.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredHikes.map((hike) => {
                            const isSelected = selectedHike?.id === hike.id;

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
                                            {getLocalizedField(hike, "duration", lang)}
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                            {hike.distance} km
                                        </span>
                                    </div>

                                    <h3 className="text-2xl text-slate-900">{getLocalizedField(hike, "name", lang)}</h3>

                                    <p className="mt-2 text-sm text-slate-700 sm:text-base">
                                        {getLocalizedField(hike, "description", lang)}
                                    </p>

                                    <div className="mt-4 rounded-[1.35rem] bg-slate-50 p-4 text-sm text-slate-600">
                                        <p><strong>{lang === "en" ? "Start point:" : "Départ :"}</strong> {getLocalizedField(hike, "startPoint", lang)}</p>
                                        <p className="mt-2">
                                            <strong>{lang === "en" ? "Perfect for:" : "Idéal pour :"}</strong>{" "}
                                            {lang === "en"
                                                ? getLocalizedField(hike, "difficulty", lang) === "Easy"
                                                    ? "a short walk or a family outing"
                                                    : "walkers already comfortable on marked trails"
                                                : getLocalizedField(hike, "difficulty", lang) === "Facile"
                                                    ? "une sortie découverte ou familiale"
                                                    : "des marcheurs déjà à l'aise sur les sentiers"}
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
                                                : isSelected ? "Parcours affiché sur la carte" : "Voir sur la carte"}
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
                        {lang === "en" ? "No walk matches your search." : "Aucune balade ne correspond à votre recherche."}
                    </div>
                )}
            </section>
        </Layout>
    );
}
