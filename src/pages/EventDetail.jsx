import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CoverImage from "../components/CoverImage";
import Layout from "../components/Layout";
import { getEvents } from "../data/loader";

export default function EventDetail() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        getEvents().then((data) => {
            const found = data.find((item) => String(item.id) === String(id));
            setEvent(found || null);
        });
    }, [id]);

    if (!event) {
        return (
            <Layout>
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-8">
                    <h1 className="mb-2 text-3xl text-slate-900">Événement introuvable</h1>
                    <p className="mb-4 text-slate-600">
                        L’événement demandé n’existe pas ou n’est plus disponible.
                    </p>
                    <Link to="/events" className="text-[#1f5e54] hover:underline">
                        Retour à la liste des événements
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <article className="surface-card overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                <CoverImage
                    src={event.image}
                    alt={event.title}
                    className="h-56 w-full object-cover sm:h-72"
                />

                <div className="p-6 sm:p-8">
                    <p className="section-kicker mb-2">
                        {event.startDate === event.endDate || !event.endDate
                            ? event.startDate || event.date
                            : `Du ${event.startDate} au ${event.endDate}`}
                    </p>

                    <h1 className="mb-4 text-3xl text-slate-900 sm:text-4xl">
                        {event.title}
                    </h1>

                    <div className="mb-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Lieu</p>
                            <p className="font-medium text-slate-900">{event.location}</p>
                        </div>

                        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Catégorie</p>
                            <p className="font-medium text-slate-900">Événement communal</p>
                        </div>
                    </div>

                    <div className="max-w-3xl space-y-4 text-slate-700">
                        <p>{event.content}</p>
                    </div>

                    <div className="mt-8">
                        <Link to="/events" className="text-[#1f5e54] hover:underline">
                            ← Retour aux événements
                        </Link>
                    </div>
                </div>
            </article>
        </Layout>
    );
}
