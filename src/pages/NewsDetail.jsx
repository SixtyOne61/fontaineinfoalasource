import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import CoverImage from "../components/CoverImage";
import { getNews } from "../data/loader";

export default function NewsDetail() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);

    useEffect(() => {
        getNews().then((data) => {
            const found = data.find((item) => String(item.id) === String(id));
            setArticle(found || null);
        });
    }, [id]);

    if (!article) {
        return (
            <Layout>
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-8">
                    <h1 className="mb-2 text-3xl text-slate-900">Actualité introuvable</h1>
                    <p className="mb-4 text-slate-600">
                        L’actualité demandée n’existe pas ou n’est plus disponible.
                    </p>
                    <Link to="/news" className="text-[#1f5e54] hover:underline">
                        Retour à la liste des actualités
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <article className="surface-card overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                <CoverImage
                    src={article.image}
                    alt={article.title}
                    className="h-56 w-full object-cover sm:h-72"
                />

                <div className="p-6 sm:p-8">
                    <p className="section-kicker mb-2">{article.date}</p>
                    <h1 className="mb-4 text-3xl text-slate-900 sm:text-4xl">
                        {article.title}
                    </h1>

                    {article.excerpt && (
                        <p className="mb-6 max-w-3xl text-base text-slate-700 sm:text-lg">{article.excerpt}</p>
                    )}

                    <div className="max-w-3xl space-y-4 text-slate-700">
                        <p>{article.content}</p>
                    </div>

                    <div className="mt-8">
                        <Link to="/news" className="text-[#1f5e54] hover:underline">
                            ← Retour aux actualités
                        </Link>
                    </div>
                </div>
            </article>
        </Layout>
    );
}
