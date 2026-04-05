import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { getEvents } from "../data/loader";

export default function Events() {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);

    useEffect(() => {
        getEvents().then((data) => {
            const today = new Date();

            const upcoming = data
                .filter((event) => new Date(event.date) >= today)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            const past = data
                .filter((event) => new Date(event.date) < today)
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            setUpcomingEvents(upcoming);
            setPastEvents(past);
        });
    }, []);

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">Événements</h1>

            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">À venir</h2>
                <div className="grid gap-4">
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event) => (
                            <Card key={event.id} title={event.title} date={event.date}>
                                <p className="text-slate-700">{event.location}</p>
                                <p className="mt-2 text-sm text-slate-600">{event.content}</p>
                            </Card>
                        ))
                    ) : (
                        <p className="text-slate-600">Aucun événement à venir pour le moment.</p>
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">Événements passés</h2>
                <div className="grid gap-4">
                    {pastEvents.length > 0 ? (
                        pastEvents.map((event) => (
                            <Card key={event.id} title={event.title} date={event.date}>
                                <p className="text-slate-700">{event.location}</p>
                            </Card>
                        ))
                    ) : (
                        <p className="text-slate-600">Aucun événement passé à afficher.</p>
                    )}
                </div>
            </section>
        </Layout>
    );
}