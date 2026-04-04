import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getNews } from "../data/loader";

export default function NewsDetail() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);

    useEffect(() => {
        getNews().then(data => {
            const found = data.find(n => n.id == id);
            setArticle(found);
        });
    }, [id]);

    if (!article) return <Layout>Chargement...</Layout>;

    return (
        <Layout>
            <h1 className="text-3xl font-bold">{article.title}</h1>
            <p className="text-gray-500">{article.date}</p>
            <p className="mt-4">{article.content}</p>
        </Layout>
    );
}