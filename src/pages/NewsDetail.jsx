import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AsyncStateCard from "../components/AsyncStateCard";
import CoverImage from "../components/CoverImage";
import Layout from "../components/Layout";
import { getNews } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";

export default function NewsDetail() {
    const { id } = useParams();
    const { lang, t } = useLocale();
    const [article, setArticle] = useState(null);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        let isMounted = true;

        async function syncArticle() {
            try {
                setStatus("loading");
                const data = await getNews();
                const found = data.find((item) => String(item.id) === String(id));

                if (!isMounted) return;

                setArticle(found || null);
                setStatus(found ? "ready" : "notFound");
            } catch (error) {
                console.error("Unable to load news detail:", error);

                if (isMounted) {
                    setArticle(null);
                    setStatus("error");
                }
            }
        }

        syncArticle();

        return () => {
            isMounted = false;
        };
    }, [id]);

    if (status === "loading") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Loading update" : "Chargement de l'info"}
                description={lang === "en" ? "The update is being prepared." : "Le contenu de l'info est en cours de chargement."}
                linkTo="/news"
                linkLabel={lang === "en" ? "Back to updates" : "Retour aux infos"}
            />
        );
    }

    if (status === "error") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Unable to load update" : "Chargement impossible"}
                description={lang === "en" ? "The update cannot be displayed right now." : "Cette information ne peut pas être affichée pour le moment."}
                linkTo="/news"
                linkLabel={lang === "en" ? "Back to updates" : "Retour aux infos"}
            />
        );
    }

    if (status === "notFound" || !article) {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Update not found" : "Info introuvable"}
                description={lang === "en" ? "This update is no longer available." : "Cette information n'est plus disponible."}
                linkTo="/news"
                linkLabel={lang === "en" ? "Back to updates" : "Retour aux infos"}
            />
        );
    }

    return (
        <Layout>
            <article className="surface-card overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                <CoverImage
                    src={article.image}
                    alt={getLocalizedField(article, "title", lang)}
                    className="h-56 w-full object-cover sm:h-72"
                />

                <div className="p-6 sm:p-8">
                    <p className="section-kicker mb-2">{article.date}</p>
                    <h1 className="mb-4 text-3xl text-slate-900 sm:text-4xl">
                        {getLocalizedField(article, "title", lang)}
                    </h1>

                    {getLocalizedField(article, "excerpt", lang) && (
                        <p className="mb-6 max-w-3xl text-base text-slate-700 sm:text-lg">{getLocalizedField(article, "excerpt", lang)}</p>
                    )}

                    <div className="max-w-3xl space-y-4 text-slate-700">
                        <p>{getLocalizedField(article, "content", lang)}</p>
                    </div>

                    <div className="mt-8">
                        <Link to="/news" className="text-[#1f5e54] hover:underline">
                            {t("common.backToNews")}
                        </Link>
                    </div>
                </div>
            </article>
        </Layout>
    );
}
