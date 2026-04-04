import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import { getNews } from "../data/loader";

export default function News() {
    const [news, setNews] = useState([]);

    useEffect(() => {
        getNews().then(setNews);
    }, []);

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">Actualités</h1>
            <div className="grid gap-4">
                {news.map((n) => (
                    <Card key={n.id} title={n.title} date={n.date}>
                        <Link to={`/news/${n.id}`} className="text-blue-600 mt-2 block">
                            Lire plus →
                        </Link>
                    </Card>
                ))}
            </div>
        </Layout>
    );
}