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
                <h1 className="text-2xl sm:text-3xl font-bold text-[#163c35]">Parkings</h1>
                <p className="mt-2 text-slate-600 max-w-2xl text-sm sm:text-base">
                    Retrouvez les parkings disponibles de la commune avec leurs accès et leurs tarifs.
                </p>
            </section>

            <section className="mb-8">
                <ParkingsMap parkings={parkings} />
            </section>

            <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-[#163c35]">
                    Liste des parkings
                </h2>

                {parkings.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {parkings.map((parking) => (
                            <article
                                key={parking.id}
                                className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5"
                            >
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                                    {parking.name}
                                </h3>

                                <p className="mt-2 text-sm sm:text-base text-slate-700">
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
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-600">
                        Aucun parking disponible pour le moment.
                    </div>
                )}
            </section>
        </Layout>
    );
}