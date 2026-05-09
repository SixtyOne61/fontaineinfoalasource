import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import ParkingAddressActions from "../components/ParkingAddressActions";
import ParkingsMap from "../components/ParkingsMap";
import { getParkings } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";

const vehicleTypes = {
    fr: [
        { key: "cars", label: "Voiture" },
        { key: "motorcycles", label: "Moto" },
        { key: "minivans", label: "Mini-van" },
        { key: "campers", label: "Camping-car" },
        { key: "all", label: "Tous" }
    ],
    en: [
        { key: "cars", label: "Car" },
        { key: "motorcycles", label: "Motorbike" },
        { key: "minivans", label: "Minivan" },
        { key: "campers", label: "Motorhome" },
        { key: "all", label: "All" }
    ]
};

function VehicleBadge({ label }) {
    return (
        <span className="inline-flex items-center rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
            {label}
        </span>
    );
}

function ParkingCard({ parking, lang, vehicleLabels, recommendation, featured = false }) {
    return (
        <article
            className={`surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] ${
                featured ? "ring-1 ring-[#d8c08f]/50" : ""
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="mb-2 inline-flex rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                        {recommendation}
                    </div>
                    <h2 className="text-2xl text-slate-900">{getLocalizedField(parking, "name", lang)}</h2>
                    <div className="mt-2 text-slate-700">
                        <ParkingAddressActions parking={parking} lang={lang} />
                    </div>
                </div>
                <div className="rounded-[1.2rem] bg-[#163c35] px-3 py-2 text-right text-white">
                    <p className="text-xs uppercase tracking-[0.12em] text-white/75">{lang === "en" ? "Day" : "Journée"}</p>
                    <p className="text-sm font-semibold">{getLocalizedField(parking, "dailyRate", lang)}</p>
                </div>
            </div>

            <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {lang === "en" ? "Suitable for" : "Convient pour"}
                </p>
                <div className="flex flex-wrap gap-2">
                    {vehicleLabels.map((vehicle) => (
                        <VehicleBadge key={vehicle.key} label={vehicle.label} />
                    ))}
                </div>
            </div>

            <div className="mt-4 grid gap-3 rounded-[1.35rem] bg-slate-50 p-4 text-sm text-slate-600">
                <p>
                    <strong>{lang === "en" ? "Short stay:" : "Tarif court séjour :"}</strong>{" "}
                    {getLocalizedField(parking, "hourlyRate", lang)}
                </p>
                <p>
                    <strong>{lang === "en" ? "Day rate:" : "Tarif journée :"}</strong>{" "}
                    {getLocalizedField(parking, "dailyRate", lang)}
                </p>
                {getLocalizedField(parking, "notes", lang) ? (
                    <p>
                        <strong>{lang === "en" ? "Good to know:" : "Bon à savoir :"}</strong>{" "}
                        {getLocalizedField(parking, "notes", lang)}
                    </p>
                ) : null}
            </div>
        </article>
    );
}

export default function Parking() {
    const { lang } = useLocale();
    const [parkings, setParkings] = useState([]);
    const [vehicleFilter, setVehicleFilter] = useState("cars");
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        getParkings().then(setParkings);
    }, []);

    function getParkingRecommendation(parking) {
        if (parking.campers) return lang === "en" ? "Good for larger vehicles" : "Adapté aux grands véhicules";
        if (parking.minivans) return lang === "en" ? "Flexible access option" : "Option souple selon le véhicule";
        if (parking.cars && parking.motorcycles) return lang === "en" ? "Simple everyday option" : "Option simple et pratique";
        return lang === "en" ? "Quick option" : "Option rapide";
    }

    const sortedParkings = useMemo(
        () => {
            function getParkingScore(parking) {
                const selectedVehicleBoost =
                    vehicleFilter !== "all" && parking[vehicleFilter]
                        ? 8
                        : 0;

                return (
                    selectedVehicleBoost +
                    Number(parking.campers) * 4 +
                    Number(parking.minivans) * 3 +
                    Number(parking.cars) * 2 +
                    Number(parking.motorcycles)
                );
            }

            return [...parkings].sort((a, b) => getParkingScore(b) - getParkingScore(a));
        },
        [parkings, vehicleFilter]
    );

    const filteredParkings = useMemo(() => {
        if (vehicleFilter === "all") {
            return sortedParkings;
        }

        return sortedParkings.filter((parking) => parking[vehicleFilter]);
    }, [sortedParkings, vehicleFilter]);

    const topParkings = filteredParkings.slice(0, 3);
    const remainingParkings = filteredParkings.slice(3);
    const selectedVehicleLabel = vehicleTypes[lang].find((vehicle) => vehicle.key === vehicleFilter)?.label;

    return (
        <Layout>
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/20 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_30%),linear-gradient(135deg,#18463e,#27685b_54%,#d3bc8d)] p-5 text-white shadow-[0_28px_90px_rgba(22,60,53,0.18)] sm:p-8 md:p-10">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div>
                        <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white/90">
                            {lang === "en" ? "Visitor access" : "Bien arriver"}
                        </p>
                        <h1 className="mt-4 text-3xl text-white sm:text-5xl">
                            {lang === "en" ? "Find parking quickly" : "Trouver un parking rapidement"}
                        </h1>
                        <p className="mt-4 max-w-2xl text-base text-[#eef7f3] sm:text-lg">
                            {lang === "en"
                                ? "Choose your vehicle first, then look at the best parking options before entering the village."
                                : "Choisissez d'abord votre véhicule, puis regardez les options les plus utiles avant d'entrer dans le village."}
                        </p>
                    </div>

                    <aside className="rounded-[1.75rem] border border-white/15 bg-[#163c35]/40 p-5 backdrop-blur-md">
                        <p className="section-kicker text-[#d7e8e1]">
                            {lang === "en" ? "Quick reminder" : "Repère rapide"}
                        </p>
                        <div className="mt-4 grid gap-3">
                            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-lg font-semibold text-white">
                                    {lang === "en" ? "Check parking before entering" : "Regarder les parkings avant d'entrer"}
                                </p>
                                <p className="mt-1 text-sm text-white/80">
                                    {lang === "en"
                                        ? "It usually avoids unnecessary turns in the village."
                                        : "Cela évite souvent des détours inutiles dans le village."}
                                </p>
                            </div>
                            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-lg font-semibold text-white">
                                    {lang === "en" ? "Then continue on foot" : "Puis continuer à pied"}
                                </p>
                                <p className="mt-1 text-sm text-white/80">
                                    {lang === "en"
                                        ? "Once parked, the center is usually easier to enjoy on foot."
                                        : "Une fois garé, le centre se visite en général plus facilement à pied."}
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <section className="mb-8">
                <div className="surface-card rounded-[1.5rem] border border-white/70 p-4 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {lang === "en" ? "1. My vehicle" : "1. Mon véhicule"}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {vehicleTypes[lang].map((vehicle) => {
                            const isActive = vehicleFilter === vehicle.key;

                            return (
                                <button
                                    key={vehicle.key}
                                    type="button"
                                    onClick={() => setVehicleFilter(vehicle.key)}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-[#1f5e54] text-white"
                                            : "border border-slate-300 bg-white text-slate-700 hover:border-[#a7cfc1] hover:text-[#1f5e54]"
                                    }`}
                                >
                                    {vehicle.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="section-kicker">{lang === "en" ? "2. Recommended options" : "2. Options recommandées"}</p>
                        <h2 className="mt-2 text-2xl text-[#163c35] sm:text-3xl">
                            {lang === "en"
                                ? `Best matches for ${selectedVehicleLabel?.toLowerCase() || "your vehicle"}`
                                : `Les meilleures options pour ${selectedVehicleLabel?.toLowerCase() || "votre véhicule"}`}
                        </h2>
                    </div>
                    <p className="text-sm text-slate-500">
                        {filteredParkings.length} {lang === "en" ? `result${filteredParkings.length > 1 ? "s" : ""}` : `résultat${filteredParkings.length > 1 ? "s" : ""}`}
                    </p>
                </div>

                {filteredParkings.length > 0 ? (
                    <div className="grid gap-5 xl:grid-cols-3">
                        {topParkings.map((parking) => (
                            <ParkingCard
                                key={parking.id}
                                parking={parking}
                                lang={lang}
                                featured
                                recommendation={getParkingRecommendation(parking)}
                                vehicleLabels={vehicleTypes[lang].filter(
                                    (vehicle) => vehicle.key !== "all" && parking[vehicle.key]
                                )}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="surface-card rounded-[1.75rem] border border-white/70 p-5 text-slate-600 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                        {lang === "en"
                            ? "No parking area matches this vehicle yet."
                            : "Aucun parking ne correspond pour l'instant à ce véhicule."}
                    </div>
                )}
            </section>

            {filteredParkings.length > 0 ? (
                <section className="mb-8">
                    <article className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="section-kicker">{lang === "en" ? "3. Need the map?" : "3. Besoin de la carte ?"}</p>
                                <h2 className="mt-2 text-2xl text-[#163c35]">
                                    {lang === "en" ? "Open the parking map if needed" : "Ouvrir la carte des parkings si besoin"}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowMap((value) => !value)}
                                className="rounded-full bg-[#1f5e54] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18463e]"
                            >
                                {showMap
                                    ? lang === "en"
                                        ? "Hide map"
                                        : "Masquer la carte"
                                    : lang === "en"
                                      ? "Show map"
                                      : "Afficher la carte"}
                            </button>
                        </div>
                        {showMap ? <div className="mt-5"><ParkingsMap parkings={filteredParkings} /></div> : null}
                    </article>
                </section>
            ) : null}

            {remainingParkings.length > 0 ? (
                <section>
                    <div className="mb-4">
                        <p className="section-kicker">{lang === "en" ? "More options" : "Autres options"}</p>
                        <h2 className="mt-2 text-2xl text-[#163c35] sm:text-3xl">
                            {lang === "en" ? "See the rest if needed" : "Voir le reste si besoin"}
                        </h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {remainingParkings.map((parking) => (
                            <ParkingCard
                                key={parking.id}
                                parking={parking}
                                lang={lang}
                                recommendation={getParkingRecommendation(parking)}
                                vehicleLabels={vehicleTypes[lang].filter(
                                    (vehicle) => vehicle.key !== "all" && parking[vehicle.key]
                                )}
                            />
                        ))}
                    </div>
                </section>
            ) : null}
        </Layout>
    );
}
