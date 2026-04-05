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
            <section className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#163c35]">Actualités</h1>
                <p className="mt-2 text-slate-600 max-w-2xl text-sm sm:text-base">
                    Retrouvez toutes les informations récentes de la commune.
                </p>
            </section>

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Rechercher une actualité..."
            />

            <section>
                {filteredNews.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredNews.map((item) => (
                            <Card
                                key={item.id}
                                title={item.title}
                                date={item.date}
                                image={item.image}
                            >
                                <p className="text-sm text-slate-700">{item.excerpt}</p>
                                <Link
                                    to={`/news/${item.id}`}
                                    className="text-[#1f5e54] hover:text-[#3f977b] hover:underline mt-3 inline-block"
                                >
                                    Lire plus →
                                </Link>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-600">
                        Aucune actualité ne correspond à votre recherche.
                    </div>
                )}
            </section>
        </Layout>
    );
}