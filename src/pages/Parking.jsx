import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import ParkingsMap from "../components/ParkingsMap";
import { getParkings } from "../data/loader";

function getParkingRecommendation(parking) {
    if (parking.campers) return "Recommandé véhicules volumineux";
    if (parking.cars && parking.motorcycles) return "Bon compromis";
    return "À vérifier";
}

function getParkingScore(parking) {
    return Number(parking.campers) * 3 + Number(parking.cars) * 2 + Number(parking.motorcycles);
}

export default function Parking() {
    const [parkings, setParkings] = useState([]);

    useEffect(() => {
        getParkings().then(setParkings);
    }, []);

    const sortedParkings = useMemo(
        () => [...parkings].sort((a, b) => getParkingScore(b) - getParkingScore(a)),
        [parkings]
    );

    return (
        <Layout>
            <section className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <h1 className="text-2xl font-bold text-[#163c35] sm:text-3xl">Parkings</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                        Retrouvez rapidement les parkings utiles selon votre véhicule, les tarifs et la localisation avant l'entrée dans le village.
                    </p>
                </div>

                <div className="grid gap-3 rounded-3xl border border-[#d7e8e1] bg-white p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-1">
                    <div>
                        <p className="text-sm text-[#5b7d76]">Conseil visiteur</p>
                        <p className="mt-1 font-semibold text-[#163c35]">Privilégier les parkings signalés dès l'arrivée.</p>
                    </div>
                    <div>
                        <p className="text-sm text-[#5b7d76]">Comparaison rapide</p>
                        <p className="mt-1 font-semibold text-[#163c35]">Véhicules autorisés, tarifs et notes pratiques.</p>
                    </div>
                    <div>
                        <p className="text-sm text-[#5b7d76]">Carte</p>
                        <p className="mt-1 font-semibold text-[#163c35]">Repérage immédiat sur mobile.</p>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <ParkingsMap parkings={sortedParkings} />
            </section>

            <section>
                <h2 className="mb-4 text-xl font-semibold text-[#163c35] sm:text-2xl">
                    Liste des parkings
                </h2>

                {sortedParkings.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {sortedParkings.map((parking) => (
                            <article
                                key={parking.id}
                                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="mb-2 inline-flex rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                            {getParkingRecommendation(parking)}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                                            {parking.name}
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-700 sm:text-base">
                                            {parking.address}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-[#163c35] px-3 py-2 text-right text-white">
                                        <p className="text-xs uppercase tracking-[0.12em] text-white/75">Jour</p>
                                        <p className="text-sm font-semibold">{parking.dailyRate}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                    {parking.cars && <span className="rounded-full bg-slate-100 px-3 py-1">Voitures</span>}
                                    {parking.motorcycles && <span className="rounded-full bg-slate-100 px-3 py-1">Motos</span>}
                                    {parking.campers && <span className="rounded-full bg-slate-100 px-3 py-1">Camping-cars</span>}
                                </div>

                                <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                                    <p><strong>Tarif horaire :</strong> {parking.hourlyRate}</p>
                                    <p><strong>Tarif journée :</strong> {parking.dailyRate}</p>
                                    {parking.notes && <p><strong>Note :</strong> {parking.notes}</p>}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">
                        Aucun parking disponible pour le moment.
                    </div>
                )}
            </section>
        </Layout>
    );
}
