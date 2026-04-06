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
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                    <p className="section-kicker">Accès visiteurs</p>
                    <h1 className="mt-2 text-3xl text-[#163c35] sm:text-4xl">Parkings</h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                        Retrouvez rapidement les parkings utiles selon votre véhicule, les tarifs et la localisation avant l'entrée dans le village.
                    </p>
                </div>

                <div className="surface-card grid gap-3 rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:grid-cols-3 lg:grid-cols-1">
                    <div>
                        <p className="section-kicker">Conseil visiteur</p>
                        <p className="mt-2 text-lg font-semibold text-[#163c35]">Privilégier les parkings signalés dès l'arrivée.</p>
                    </div>
                    <div>
                        <p className="section-kicker">Comparaison rapide</p>
                        <p className="mt-2 text-lg font-semibold text-[#163c35]">Véhicules autorisés, tarifs et notes pratiques.</p>
                    </div>
                    <div>
                        <p className="section-kicker">Carte</p>
                        <p className="mt-2 text-lg font-semibold text-[#163c35]">Repérage immédiat sur mobile.</p>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <ParkingsMap parkings={sortedParkings} />
            </section>

            <section>
                <h2 className="mb-4 text-2xl text-[#163c35] sm:text-3xl">Liste des parkings</h2>

                {sortedParkings.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {sortedParkings.map((parking) => (
                            <article
                                key={parking.id}
                                className="surface-card rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="mb-2 inline-flex rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                                            {getParkingRecommendation(parking)}
                                        </div>
                                        <h3 className="text-2xl text-slate-900">{parking.name}</h3>
                                        <p className="mt-2 text-sm text-slate-700 sm:text-base">
                                            {parking.address}
                                        </p>
                                    </div>
                                    <div className="rounded-[1.2rem] bg-[#163c35] px-3 py-2 text-right text-white">
                                        <p className="text-xs uppercase tracking-[0.12em] text-white/75">Jour</p>
                                        <p className="text-sm font-semibold">{parking.dailyRate}</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                    {parking.cars && <span className="rounded-full bg-slate-100 px-3 py-1">Voitures</span>}
                                    {parking.motorcycles && <span className="rounded-full bg-slate-100 px-3 py-1">Motos</span>}
                                    {parking.campers && <span className="rounded-full bg-slate-100 px-3 py-1">Camping-cars</span>}
                                </div>

                                <div className="mt-4 grid gap-3 rounded-[1.35rem] bg-slate-50 p-4 text-sm text-slate-600">
                                    <p><strong>Tarif horaire :</strong> {parking.hourlyRate}</p>
                                    <p><strong>Tarif journée :</strong> {parking.dailyRate}</p>
                                    {parking.notes && <p><strong>Note :</strong> {parking.notes}</p>}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="surface-card rounded-[1.75rem] border border-white/70 p-5 text-slate-600 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                        Aucun parking disponible pour le moment.
                    </div>
                )}
            </section>
        </Layout>
    );
}
