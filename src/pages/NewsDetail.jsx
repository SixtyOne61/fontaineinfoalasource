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
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                        Actualité introuvable
                    </h1>
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
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <CoverImage
                    src={article.image}
                    alt={article.title}
                    className="h-56 w-full object-cover sm:h-72"
                />

                <div className="p-5 sm:p-8">
                    <p className="mb-2 text-sm text-slate-500">{article.date}</p>

                    <h1 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                        {article.title}
                    </h1>

                    {article.excerpt && (
                        <p className="mb-6 text-base text-slate-700 sm:text-lg">{article.excerpt}</p>
                    )}

                    <div className="prose max-w-none text-slate-700">
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
