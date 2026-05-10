import { createContext } from "react";

export const LocaleContext = createContext(null);

export const translations = {
    fr: {
        common: {
            home: "Accueil",
            guide: "Guide",
            parkings: "Parkings",
            events: "Événements",
            hikes: "Balades",
            news: "Infos",
            photos: "Fontaine en photo",
            menu: "Menu",
            close: "Fermer",
            search: "Rechercher",
            skipToContent: "Aller au contenu principal",
            readMore: "Lire la suite ->",
            viewDetails: "Voir le détail ->",
            backToNews: "<- Retour aux infos",
            backToEvents: "<- Retour aux événements",
            backToHikes: "<- Retour aux balades",
            today: "Aujourd'hui",
            thisWeek: "Cette semaine",
            inProgress: "En ce moment",
            upcoming: "À venir",
            noResults: "Aucun résultat",
        },
    },
    en: {
        common: {
            home: "Home",
            guide: "Guide",
            parkings: "Parking",
            events: "Events",
            hikes: "Walks",
            news: "Updates",
            photos: "Fontaine in photos",
            menu: "Menu",
            close: "Close",
            search: "Search",
            skipToContent: "Skip to main content",
            readMore: "Read more ->",
            viewDetails: "View details ->",
            backToNews: "<- Back to updates",
            backToEvents: "<- Back to events",
            backToHikes: "<- Back to walks",
            today: "Today",
            thisWeek: "This week",
            inProgress: "Happening now",
            upcoming: "Coming up",
            noResults: "No results",
        },
    },
};

export function getBrowserDefault() {
    if (typeof window === "undefined") {
        return "fr";
    }

    return window.localStorage.getItem("fontaine-lang") || "fr";
}

export function getLocalizedField(item, field, lang) {
    if (!item) return "";

    const localizedField = `${field}En`;
    const englishValue = item?.[localizedField];
    const defaultValue = item?.[field];

    if (lang === "en" && typeof englishValue === "string" && englishValue.trim()) {
        return englishValue;
    }

    return typeof defaultValue === "string" ? defaultValue : "";
}

export function getLocalizedList(item, field, lang) {
    if (!item) return [];

    const localizedField = `${field}En`;
    const englishValue = item?.[localizedField];
    const defaultValue = item?.[field];

    if (lang === "en" && Array.isArray(englishValue) && englishValue.length > 0) {
        return englishValue;
    }

    return Array.isArray(defaultValue) ? defaultValue : [];
}
