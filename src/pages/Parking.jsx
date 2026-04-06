import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import ParkingsMap from "../components/ParkingsMap";
import { getParkings } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";

const vehicleTypes = {
    fr: [
        { key: "all", label: "Tous" },
        { key: "motorcycles", label: "Moto" },
        { key: "cars", label: "Voiture" },
        { key: "minivans", label: "Mini-van" },
        { key: "campers", label: "Camping-car" },
    ],
    en: [
        { key: "all", label: "All" },
        { key: "motorcycles", label: "Motorbike" },
        { key: "cars", label: "Car" },
        { key: "minivans", label: "Minivan" },
        { key: "campers", label: "Motorhome" },
    ],
};

function VehicleBadge({ label }) {
    return (
        <span className="inline-flex items-center rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
            {label}
        </span>
    );
}

export default function Parking() {
    const { lang } = useLocale();
    const [parkings, setParkings] = useState([]);
    const [vehicleFilter, setVehicleFilter] = useState("all");

    useEffect(() => {
        getParkings().then(setParkings);
    }, []);

    function getParkingRecommendation(parking) {
        if (parking.campers) return lang === "en" ? "Suitable for larger vehicles" : "Adapté aux véhicules volumineux";
        if (parking.cars && parking.motorcycles) return lang === "en" ? "Good all-round option" : "Bon compromis";
        return lang === "en" ? "Check details" : "À vérifier";
    }

    function getParkingScore(parking) {
        return (
            Number(parking.campers) * 4 +
            Number(parking.minivans) * 3 +
            Number(parking.cars) * 2 +
            Number(parking.motorcycles)
        );
    }

    const sortedParkings = useMemo(
        () => [...parkings].sort((a, b) => getParkingScore(b) - getParkingScore(a)),
        [parkings]
    );

    const filteredParkings = useMemo(() => {
        if (vehicleFilter === "all") {
            return sortedParkings;
        }

        return sortedParkings.filter((parking) => parking[vehicleFilter]);
    }, [sortedParkings, vehicleFilter]);

    return (
        <Layout>
            <section className="mb-8">
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                    <p className="section-kicker">{lang === "en" ? "Visitor access" : "Accès visiteurs"}</p>
                    <h1 className="mt-2 text-3xl text-[#163c35] sm:text-4xl">{lang === "en" ? "Parking" : "Parkings"}</h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                        {lang === "en"
                            ? "Quickly find suitable parking based on your vehicle, with clear details on allowed vehicles."
                            : "Retrouvez rapidement les parkings utiles selon votre véhicule, avec une lecture directe des véhicules acceptés."}
                    </p>
                </div>
            </section>

            <div className="surface-card mb-6 rounded-[1.5rem] border border-white/70 p-4 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {lang === "en" ? "My vehicle" : "Mon véhicule"}
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

            <section className="mb-8">
                <ParkingsMap parkings={filteredParkings} />
            </section>

            <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-2xl text-[#163c35] sm:text-3xl">{lang === "en" ? "Parking list" : "Liste des parkings"}</h2>
                    <p className="text-sm text-slate-500">
                        {filteredParkings.length} {lang === "en" ? `result${filteredParkings.length > 1 ? "s" : ""}` : `résultat${filteredParkings.length > 1 ? "s" : ""}`}
                    </p>
                </div>

                {filteredParkings.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredParkings.map((parking) => (
                            <article
                                key={parking.id}
                                className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="mb-2 inline-flex rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                            {getParkingRecommendation(parking)}
                                        </div>
                                        <h3 className="text-2xl text-slate-900">{getLocalizedField(parking, "name", lang)}</h3>
                                        <p className="mt-2 text-sm text-slate-700 sm:text-base">
                                            {getLocalizedField(parking, "address", lang)}
                                        </p>
                                    </div>
                                    <div className="rounded-[1.2rem] bg-[#163c35] px-3 py-2 text-right text-white">
                                        <p className="text-xs uppercase tracking-[0.12em] text-white/75">{lang === "en" ? "Day" : "Jour"}</p>
                                        <p className="text-sm font-semibold">{getLocalizedField(parking, "dailyRate", lang)}</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                        {lang === "en" ? "Allowed vehicles" : "Véhicules acceptés"}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {vehicleTypes[lang]
                                            .filter((vehicle) => vehicle.key !== "all" && parking[vehicle.key])
                                            .map((vehicle) => (
                                                <VehicleBadge key={vehicle.key} label={vehicle.label} />
                                            ))}
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 rounded-[1.35rem] bg-slate-50 p-4 text-sm text-slate-600">
                                    <p><strong>{lang === "en" ? "Hourly rate:" : "Tarif horaire :"}</strong> {getLocalizedField(parking, "hourlyRate", lang)}</p>
                                    <p><strong>{lang === "en" ? "Daily rate:" : "Tarif journée :"}</strong> {getLocalizedField(parking, "dailyRate", lang)}</p>
                                    {getLocalizedField(parking, "notes", lang) && <p><strong>{lang === "en" ? "Note:" : "Note :"}</strong> {getLocalizedField(parking, "notes", lang)}</p>}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="surface-card rounded-[1.75rem] border border-white/70 p-5 text-slate-600 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                        {lang === "en" ? "No parking area matches the selected vehicle." : "Aucun parking ne correspond au véhicule sélectionné."}
                    </div>
                )}
            </section>
        </Layout>
    );
}
