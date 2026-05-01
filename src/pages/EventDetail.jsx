import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AsyncStateCard from "../components/AsyncStateCard";
import CoverImage from "../components/CoverImage";
import Layout from "../components/Layout";
import { getEvents } from "../data/loader";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";
import { getEventEndDate, getEventStartDate, getRecurrenceLabel, parseLocalDate } from "../utils/events";

function getStartOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function formatDisplayDate(value, lang) {
    const date = parseLocalDate(value);
    if (!date) return "";

    return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function formatEventDateRange(event, lang) {
    const start = getEventStartDate(event);
    const end = getEventEndDate(event);

    if (!start) return "";
    if (!end || start === end) return formatDisplayDate(start, lang);

    return lang === "en"
        ? `From ${formatDisplayDate(start, lang)} to ${formatDisplayDate(end, lang)}`
        : `Du ${formatDisplayDate(start, lang)} au ${formatDisplayDate(end, lang)}`;
}

function getStatusLabel(event, lang) {
    const today = getStartOfToday();
    const start = parseLocalDate(getEventStartDate(event));
    const end = parseLocalDate(getEventEndDate(event));

    if (!start || !end) return lang === "en" ? "Coming up" : "A venir";
    if (today >= start && today <= end) return lang === "en" ? "Happening now" : "En ce moment";

    const diffDays = Math.floor((start - today) / 86400000);
    if (diffDays === 0) return lang === "en" ? "Today" : "Aujourd'hui";
    if (diffDays > 0 && diffDays <= 6) return lang === "en" ? "This week" : "Cette semaine";
    if (diffDays > 6) return lang === "en" ? "Later" : "Plus tard";
    return lang === "en" ? "Past" : "Passe";
}

function getDecisionSummary(event, lang) {
    const today = getStartOfToday();
    const start = parseLocalDate(getEventStartDate(event));
    const end = parseLocalDate(getEventEndDate(event));

    if (!start || !end) {
        return lang === "en"
            ? "Check the location and full details before setting off."
            : "Verifiez le lieu et les informations detaillees avant de vous deplacer.";
    }

    if (today >= start && today <= end) {
        return lang === "en"
            ? "Useful if you want to go today. Check the meeting point before leaving."
            : "Utile si vous cherchez une sortie aujourd'hui. Verifiez le lieu de rendez-vous avant de partir.";
    }

    const diffDays = Math.floor((start - today) / 86400000);

    if (diffDays === 0) {
        return lang === "en"
            ? "Scheduled for today. A good option if you want something nearby without much planning."
            : "Prevu aujourd'hui. Une bonne option si vous voulez une sortie proche sans grande preparation.";
    }

    if (diffDays > 0 && diffDays <= 6) {
        return lang === "en"
            ? "Coming up this week. Practical if you are staying in the area for a few days."
            : "A venir cette semaine. Pratique si vous restez quelques jours dans le secteur.";
    }

    return lang === "en"
        ? "Keep this date in mind for a later visit."
        : "A garder en tete pour une prochaine venue.";
}

function splitContent(content) {
    if (!content) return [];

    return content
        .split(/\r?\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
}

function buildQuickPoints(event, lang) {
    const points = [];

    const dateLabel = formatEventDateRange(event, lang);
    if (dateLabel) {
        points.push({
            label: lang === "en" ? "When" : "Quand",
            value: dateLabel,
        });
    }

    const location = getLocalizedField(event, "location", lang);
    if (location) {
        points.push({
            label: lang === "en" ? "Where" : "Ou",
            value: location,
        });
    }

    if (event.recurrence) {
        points.push({
            label: lang === "en" ? "Rhythm" : "Rythme",
            value: getRecurrenceLabel(event, lang),
        });
    }

    points.push({
        label: lang === "en" ? "Good for" : "Utile pour",
        value:
            lang === "en"
                ? "A quick village outing, a family stop or a simple local activity."
                : "Une sortie rapide dans le village, une pause en famille ou une activite locale simple.",
    });

    return points;
}

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

    const contentParagraphs = useMemo(() => splitContent(getLocalizedField(event, "content", lang)), [event, lang]);
    const quickPoints = useMemo(() => (event ? buildQuickPoints(event, lang) : []), [event, lang]);

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
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-semibold text-[#1f5e54]">
                            {getStatusLabel(event, lang)}
                        </span>
                        {event.recurrence && (
                            <span className="inline-flex rounded-full border border-[#d5e6df] px-3 py-1 text-xs font-medium text-[#41665e]">
                                {getRecurrenceLabel(event, lang)}
                            </span>
                        )}
                    </div>

                    <p className="section-kicker mb-2">{formatEventDateRange(event, lang)}</p>

                    <h1 className="mb-3 text-3xl text-slate-900 sm:text-4xl">
                        {getLocalizedField(event, "title", lang)}
                    </h1>

                    <p className="max-w-3xl text-sm text-[#355d55] sm:text-base">{getDecisionSummary(event, lang)}</p>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
                        <div className="space-y-4 text-slate-700">
                            {contentParagraphs.map((paragraph, index) => (
                                <p key={`${event.id}-paragraph-${index}`}>{paragraph}</p>
                            ))}
                        </div>

                        <aside className="space-y-3">
                            {quickPoints.map((point) => (
                                <div key={point.label} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-sm text-slate-500">{point.label}</p>
                                    <p className="font-medium text-slate-900">{point.value}</p>
                                </div>
                            ))}
                        </aside>
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
