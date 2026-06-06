import { useEffect, useState } from "react";
import AsyncStateCard from "../components/AsyncStateCard";
import Layout from "../components/Layout";
import ToiletAddressActions from "../components/ToiletAddressActions";
import ToiletsMap from "../components/ToiletsMap";
import { getToilets } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";

function ToiletRow({ toilet, lang }) {
    return (
        <article className="surface-card grid gap-3 rounded-[1.25rem] border border-white/70 p-4 shadow-[0_12px_34px_rgba(22,60,53,0.07)] sm:grid-cols-[minmax(0,1fr)_8.5rem] sm:items-center">
            <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900">{getLocalizedField(toilet, "name", lang)}</h2>
                {toilet.address ? <p className="mt-1 text-sm text-slate-600">{toilet.address}</p> : null}
            </div>
            <div className="sm:justify-self-end">
                <ToiletAddressActions toilet={toilet} lang={lang} showAddress={false} />
            </div>
        </article>
    );
}

export default function Toilets() {
    const { lang } = useLocale();
    const [status, setStatus] = useState("loading");
    const [toilets, setToilets] = useState([]);

    useEffect(() => {
        let isMounted = true;

        async function syncToilets() {
            try {
                setStatus("loading");
                const data = await getToilets();

                if (!isMounted) return;

                setToilets(data);
                setStatus("ready");
            } catch (error) {
                console.error("Unable to load toilets:", error);

                if (isMounted) {
                    setStatus("error");
                }
            }
        }

        syncToilets();

        return () => {
            isMounted = false;
        };
    }, []);

    if (status === "loading") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Loading public toilets" : "Chargement des toilettes publiques"}
                description={
                    lang === "en"
                        ? "The public toilet map is being prepared."
                        : "La carte des toilettes publiques est en cours de chargement."
                }
            />
        );
    }

    if (status === "error") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Unable to load public toilets" : "Chargement impossible"}
                description={
                    lang === "en"
                        ? "The public toilet information cannot be displayed right now."
                        : "Les informations sur les toilettes publiques ne peuvent pas etre affichees pour le moment."
                }
            />
        );
    }

    return (
        <Layout>
            {toilets.length > 0 ? (
                <>
                    <section className="mb-6">
                        <ToiletsMap toilets={toilets} />
                    </section>

                    <section>
                        <div className="grid gap-3">
                            {toilets.map((toilet) => (
                                <ToiletRow key={toilet.id} toilet={toilet} lang={lang} />
                            ))}
                        </div>
                    </section>
                </>
            ) : (
                <section className="surface-card rounded-[1.75rem] border border-white/70 p-5 text-slate-600 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                    {lang === "en"
                        ? "No public toilet has been listed yet."
                        : "Aucune toilette publique n'est encore renseignee."}
                </section>
            )}
        </Layout>
    );
}
