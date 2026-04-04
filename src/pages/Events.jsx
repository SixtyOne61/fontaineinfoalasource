import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { getEvents } from "../data/loader";

export default function Events() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        getEvents().then(setEvents);
    }, []);

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">Événements</h1>
            <div className="grid gap-4">
                {events.map((e) => (
                    <Card key={e.id} title={e.title} date={e.date}>
                        <p>{e.location}</p>
                    </Card>
                ))}
            </div>
        </Layout>
    );
}