import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ParkingsMap from "../components/ParkingsMap";
import { getParkings } from "../data/loader";

function yesNo(value) {
    return value ? "Oui" : "Non";
}

export default function Parking() {
    const [parkings, setParkings] = useState([]);

    useEffect(() => {
        getParkings().then(setParkings);
    }, []);

    return (
        <Layout>
            <section className="mb-8">
                <h1 className="text-2xl font-bold text-[#163c35] sm:text-3xl">Parkings</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                    Retrouvez les parkings disponibles de la commune avec leurs accès et leurs
                    tarifs.
                </p>
            </section>

            <section className="mb-8">
                <ParkingsMap parkings={parkings} />
            </section>

            <section>
                <h2 className="mb-4 text-xl font-semibold text-[#163c35] sm:text-2xl">
                    Liste des parkings
                </h2>

                {parkings.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {parkings.map((parking) => (
                            <article
                                key={parking.id}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                            >
                                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                                    {parking.name}
                                </h3>

                                <p className="mt-2 text-sm text-slate-700 sm:text-base">
                                    {parking.address}
                                </p>

                                <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-600">
                                    <p><strong>Voitures :</strong> {yesNo(parking.cars)}</p>
                                    <p><strong>Motos :</strong> {yesNo(parking.motorcycles)}</p>
                                    <p><strong>Camping-cars :</strong> {yesNo(parking.campers)}</p>
                                    <p><strong>Tarif horaire :</strong> {parking.hourlyRate}</p>
                                    <p><strong>Tarif journée :</strong> {parking.dailyRate}</p>
                                </div>

                                {parking.notes && (
                                    <p className="mt-4 text-sm text-slate-600">{parking.notes}</p>
                                )}
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
