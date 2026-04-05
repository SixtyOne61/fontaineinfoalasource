import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
                <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-8 shadow-sm">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        Actualité introuvable
                    </h1>
                    <p className="text-slate-600 mb-4">
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
            <article className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
                <CoverImage
                    src={article.image}
                    alt={article.title}
                    className="h-56 sm:h-72 w-full object-cover"
                />

                <div className="p-5 sm:p-8">
                    <p className="text-sm text-slate-500 mb-2">{article.date}</p>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                        {article.title}
                    </h1>

                    {article.excerpt && (
                        <p className="text-base sm:text-lg text-slate-700 mb-6">
                            {article.excerpt}
                        </p>
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