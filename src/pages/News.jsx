import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Card from "../components/Card";
import SearchBar from "../components/SearchBar";
import { getNews } from "../data/loader";

export default function News() {
    const [news, setNews] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getNews().then((data) => {
            const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
            setNews(sorted);
        });
    }, []);

    const filteredNews = useMemo(() => {
        const term = search.toLowerCase();

        return news.filter((item) => {
            return (
                item.title?.toLowerCase().includes(term) ||
                item.excerpt?.toLowerCase().includes(term) ||
                item.content?.toLowerCase().includes(term)
            );
        });
    }, [news, search]);

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">Actualités</h1>

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher une actualité..."
            />

            <div className="grid gap-4">
                {filteredNews.length > 0 ? (
                    filteredNews.map((item) => (
                        <Card key={item.id} title={item.title} date={item.date}>
                            <p className="text-sm text-slate-700">{item.excerpt}</p>
                            <Link
                                to={`/news/${item.id}`}
                                className="text-[#1f5e54] mt-3 inline-block hover:underline"
                            >
                                Lire plus →
                            </Link>
                        </Card>
                    ))
                ) : (
                    <p className="text-slate-600">Aucune actualité ne correspond à votre recherche.</p>
                )}
            </div>
        </Layout>
    );
}