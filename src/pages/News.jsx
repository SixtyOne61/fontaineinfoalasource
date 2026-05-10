import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AsyncStateCard from "../components/AsyncStateCard";
import Card from "../components/Card";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import { getNews } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";

export default function News() {
    const { lang, t } = useLocale();
    const [status, setStatus] = useState("loading");
    const [news, setNews] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function syncNews() {
            try {
                setStatus("loading");
                const data = await getNews();
                const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

                if (!isMounted) return;

                setNews(sorted);
                setStatus("ready");
            } catch (error) {
                console.error("Unable to load news:", error);

                if (isMounted) {
                    setStatus("error");
                }
            }
        }

        syncNews();

        return () => {
            isMounted = false;
        };
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

    if (status === "loading") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Loading updates" : "Chargement des infos"}
                description={
                    lang === "en"
                        ? "The local updates are being prepared."
                        : "Les informations locales sont en cours de chargement."
                }
            />
        );
    }

    if (status === "error") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Unable to load updates" : "Chargement impossible"}
                description={
                    lang === "en"
                        ? "The local updates cannot be displayed right now."
                        : "Les informations locales ne peuvent pas être affichées pour le moment."
                }
            />
        );
    }

    return (
        <Layout>
            <section className="mb-8">
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                    <p className="section-kicker">{lang === "en" ? "Local updates" : "Infos du moment"}</p>
                    <h1 className="mt-2 text-3xl text-[#163c35] sm:text-4xl">{lang === "en" ? "Useful updates" : "Infos utiles"}</h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                        {lang === "en"
                            ? "Find recent local updates and practical information for both visitors and residents."
                            : "Retrouvez les infos récentes de la commune et les messages pratiques utiles aux visiteurs comme aux habitants."}
                    </p>
                </div>
            </section>

            <div className="surface-card mb-6 rounded-[1.75rem] border border-white/70 p-4 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder={lang === "en" ? "Search an update..." : "Rechercher une info..."}
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
                        {lang === "en" ? "No update matches your search." : "Aucune info ne correspond à votre recherche."}
                    </div>
                )}
            </section>
        </Layout>
    );
}
