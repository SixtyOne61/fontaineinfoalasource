import { useEffect, useState } from "react";
import AsyncStateCard from "../components/AsyncStateCard";
import CoverImage from "../components/CoverImage";
import Layout from "../components/Layout";
import { getPhotoGroups } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";

export default function Photos() {
    const { lang } = useLocale();
    const [status, setStatus] = useState("loading");
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        let isMounted = true;

        async function syncPhotos() {
            try {
                setStatus("loading");
                const data = await getPhotoGroups();

                if (!isMounted) return;

                setGroups(data);
                setStatus("ready");
            } catch (error) {
                console.error("Unable to load photos:", error);

                if (isMounted) {
                    setStatus("error");
                }
            }
        }

        syncPhotos();

        return () => {
            isMounted = false;
        };
    }, []);

    if (status === "loading") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Loading photos" : "Chargement des photos"}
                description={
                    lang === "en"
                        ? "The photo galleries are being prepared."
                        : "Les galeries photo sont en cours de chargement."
                }
            />
        );
    }

    if (status === "error") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Unable to load photos" : "Chargement impossible"}
                description={
                    lang === "en"
                        ? "The photo galleries cannot be displayed right now."
                        : "Les galeries photo ne peuvent pas être affichées pour le moment."
                }
            />
        );
    }

    return (
        <Layout>
            <section className="mb-8">
                <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                    <p className="section-kicker">{lang === "en" ? "Photo gallery" : "Galerie photo"}</p>
                    <h1 className="mt-2 text-3xl text-[#163c35] sm:text-4xl">
                        {lang === "en" ? "Fontaine in photos" : "Fontaine en photo"}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                        {lang === "en"
                            ? "Browse the village through a more visual selection."
                            : "Parcourez le village à travers une sélection plus visuelle."}
                    </p>
                </div>
            </section>

            {groups.length > 0 ? (
                <section className="grid gap-6">
                    {groups.map((group) => (
                        <article
                            key={group.id}
                            className="surface-card rounded-[1.9rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-6"
                        >
                            <div className="mb-5 max-w-3xl">
                                <p className="section-kicker">{lang === "en" ? "Photo group" : "Groupe photo"}</p>
                                <h2 className="mt-2 text-2xl text-[#163c35] sm:text-3xl">
                                    {getLocalizedField(group, "title", lang)}
                                </h2>
                                <p className="mt-3 text-sm text-slate-600 sm:text-base">
                                    {getLocalizedField(group, "description", lang)}
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {group.photos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50"
                                    >
                                        <CoverImage
                                            src={photo.image}
                                            alt={getLocalizedField(group, "title", lang)}
                                            className="h-64 w-full object-cover"
                                            fallbackText={lang === "en" ? "Image unavailable" : "Image indisponible"}
                                        />
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
                </section>
            ) : (
                <section>
                    <div className="surface-card rounded-[1.75rem] border border-white/70 p-5 text-slate-600 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                        {lang === "en"
                            ? "No photo group has been added yet."
                            : "Aucun groupe photo n'a encore été ajouté."}
                    </div>
                </section>
            )}
        </Layout>
    );
}
