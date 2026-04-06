import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import { getNews } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";

export default function News() {
    const { lang, t } = useLocale();
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
                getLocalizedField(item, "title", lang).toLowerCase().includes(term) ||
                getLocalizedField(item, "excerpt", lang).toLowerCase().includes(term) ||
                getLocalizedField(item, "content", lang).toLowerCase().includes(term)
            );
        });
    }, [lang, news, search]);

    return (
        <Layout>
            <section className="mb-8">
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                    <p className="section-kicker">{lang === "en" ? "Local information" : "Informations communales"}</p>
                    <h1 className="mt-2 text-3xl text-[#163c35] sm:text-4xl">{lang === "en" ? "News" : "Actualités"}</h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                        {lang === "en"
                            ? "Find the latest local information and practical updates for both residents and visitors."
                            : "Retrouvez les informations récentes de la commune et les messages pratiques utiles aux habitants comme aux visiteurs."}
                    </p>
                </div>
            </section>

            <div className="surface-card mb-6 rounded-[1.75rem] border border-white/70 p-4 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder={lang === "en" ? "Search news..." : "Rechercher une actualité..."}
                />
            </div>

            <section>
                {filteredNews.length > 0 ? (
                    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredNews.map((item) => (
                            <Card key={item.id} title={getLocalizedField(item, "title", lang)} date={item.date} image={item.image}>
                                <p className="text-sm text-slate-700">{getLocalizedField(item, "excerpt", lang)}</p>
                                <Link
                                    to={`/news/${item.id}`}
                                    className="mt-3 inline-block text-[#1f5e54] hover:text-[#3f977b] hover:underline"
                                >
                                    {t("common.readMore")}
                                </Link>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="surface-card rounded-[1.75rem] border border-white/70 p-5 text-slate-600 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                        {lang === "en" ? "No news item matches your search." : "Aucune actualité ne correspond à votre recherche."}
                    </div>
                )}
            </section>
        </Layout>
    );
}
