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
            <section className="mb-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                    <p className="section-kicker">Informations communales</p>
                    <h1 className="mt-2 text-3xl text-[#163c35] sm:text-4xl">Actualités</h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                        Retrouvez toutes les informations récentes de la commune et les messages pratiques utiles aux habitants comme aux visiteurs.
                    </p>
                </div>
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                    <p className="section-kicker">À savoir</p>
                    <p className="mt-2 text-lg font-semibold text-[#163c35]">
                        Cette rubrique regroupe les informations de circulation, d'accueil et d'organisation locale.
                    </p>
                </div>
            </section>

            <div className="surface-card mb-6 rounded-[1.75rem] border border-white/70 p-4 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher une actualité..."
                />
            </div>

            <section>
                {filteredNews.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredNews.map((item) => (
                            <Card key={item.id} title={item.title} date={item.date} image={item.image}>
                                <p className="text-sm text-slate-700">{item.excerpt}</p>
                                <Link
                                    to={`/news/${item.id}`}
                                    className="mt-3 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                                >
                                    Lire plus →
                                </Link>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="surface-card rounded-[1.75rem] border border-white/70 p-5 text-slate-600 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                        Aucune actualité ne correspond à votre recherche.
                    </div>
                )}
            </section>
        </Layout>
    );
}
