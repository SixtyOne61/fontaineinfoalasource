import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AsyncStateCard from "../components/AsyncStateCard";
import CoverImage from "../components/CoverImage";
import Layout from "../components/Layout";
import { getEvents } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";
import { getEventEndDate, getEventStartDate, getRecurrenceLabel } from "../utils/events";

export default function EventDetail() {
    const { id } = useParams();
    const { lang, t } = useLocale();
    const [event, setEvent] = useState(null);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        let isMounted = true;

        async function syncEvent() {
            try {
                setStatus("loading");
                const data = await getEvents();
                const found = data.find((item) => String(item.id) === String(id));

                if (!isMounted) return;

                setEvent(found || null);
                setStatus(found ? "ready" : "notFound");
            } catch (error) {
                console.error("Unable to load event detail:", error);

                if (isMounted) {
                    setEvent(null);
                    setStatus("error");
                }
            }
        }

        syncEvent();

        return () => {
            isMounted = false;
        };
    }, [id]);

    if (status === "loading") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Loading event" : "Chargement de l evenement"}
                description={lang === "en" ? "The event details are being prepared." : "Les details de l evenement sont en cours de chargement."}
                linkTo="/events"
                linkLabel={lang === "en" ? "Back to events" : "Retour aux evenements"}
            />
        );
    }

    if (status === "error") {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Unable to load event" : "Chargement impossible"}
                description={lang === "en" ? "The event details cannot be displayed right now." : "Les details de l evenement ne peuvent pas etre affiches pour le moment."}
                linkTo="/events"
                linkLabel={lang === "en" ? "Back to events" : "Retour aux evenements"}
            />
        );
    }

    if (status === "notFound" || !event) {
        return (
            <AsyncStateCard
                title={lang === "en" ? "Event not found" : "Evenement introuvable"}
                description={lang === "en" ? "This event is no longer available." : "Cet evenement n est plus disponible."}
                linkTo="/events"
                linkLabel={lang === "en" ? "Back to events" : "Retour aux evenements"}
            />
        );
    }

    return (
        <Layout>
            <article className="surface-card overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_18px_60px_rgba(22,60,53,0.08)]">
                <CoverImage
                    src={event.image}
                    alt={getLocalizedField(event, "title", lang)}
                    className="h-56 w-full object-cover sm:h-72"
                />

                <div className="p-6 sm:p-8">
                    <p className="section-kicker mb-2">
                        {getEventStartDate(event) === getEventEndDate(event) || !getEventEndDate(event)
                            ? getEventStartDate(event)
                            : lang === "en"
                                ? `From ${getEventStartDate(event)} to ${getEventEndDate(event)}`
                                : `Du ${getEventStartDate(event)} au ${getEventEndDate(event)}`}
                    </p>

                    <h1 className="mb-4 text-3xl text-slate-900 sm:text-4xl">
                        {getLocalizedField(event, "title", lang)}
                    </h1>

                    <div className="mb-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">{lang === "en" ? "Where" : "Lieu"}</p>
                            <p className="font-medium text-slate-900">{getLocalizedField(event, "location", lang)}</p>
                        </div>

                        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">{lang === "en" ? "Type" : "Type"}</p>
                            <p className="font-medium text-slate-900">{lang === "en" ? "Local event" : "Evenement local"}</p>
                        </div>
                    </div>

                    {event.recurrence && (
                        <div className="mb-6 rounded-[1.35rem] border border-[#d7e8e1] bg-[#f5fbf8] p-4">
                            <p className="text-sm text-slate-500">{lang === "en" ? "Frequency" : "Frequence"}</p>
                            <p className="font-medium text-slate-900">{getRecurrenceLabel(event, lang)}</p>
                        </div>
                    )}

                    <div className="max-w-3xl space-y-4 text-slate-700">
                        <p>{getLocalizedField(event, "content", lang)}</p>
                    </div>

                    <div className="mt-8">
                        <Link to="/events" className="text-[#1f5e54] hover:underline">
                            {t("common.backToEvents")}
                        </Link>
                    </div>
                </div>
            </article>
        </Layout>
    );
}
