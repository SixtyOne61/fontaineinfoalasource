import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { getHikes } from "../data/loader";

export default function Hikes() {
    const [hikes, setHikes] = useState([]);

    useEffect(() => {
        getHikes().then(setHikes);
    }, []);

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">Randonnées</h1>
            <div className="grid gap-4">
                {hikes.map((h) => (
                    <Card key={h.id} title={h.name}>
                        <p>Distance : {h.distance} km</p>
                        <p>Difficulté : {h.difficulty}</p>
                    </Card>
                ))}
            </div>
        </Layout>
    );
}