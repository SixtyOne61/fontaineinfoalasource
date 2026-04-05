import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Événement introuvable
                    </h1>
                    <p className="text-slate-600 mb-4">
                        L’événement demandé n’existe pas ou n’est plus disponible.
                    </p>
                    <Link to="/events" className="text-[#1f5e54] hover:text-[#3f977b] hover:underline">
                        Retour à la liste des événements
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <article className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
                <p className="text-sm text-slate-500 mb-2">{event.date}</p>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">{event.title}</h1>

                <div className="grid gap-4 md:grid-cols-2 mb-6">
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                        <p className="text-sm text-slate-500">Lieu</p>
                        <p className="font-medium text-slate-900">{event.location}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                        <p className="text-sm text-slate-500">Type</p>
                        <p className="font-medium text-slate-900">Événement communal</p>
                    </div>
                </div>

                <div className="prose max-w-none text-slate-700">
                    <p>{event.content}</p>
                </div>

                <div className="mt-8">
                    <Link to="/events" className="text-[#1f5e54] hover:text-[#3f977b] hover:underline">
                        ← Retour aux événements
                    </Link>
                </div>
            </article>
        </Layout>
    );
}