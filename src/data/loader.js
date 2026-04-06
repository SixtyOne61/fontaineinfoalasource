import {
    sanitizeBoolean,
    sanitizeDate,
    sanitizeId,
    sanitizeInternalPath,
    sanitizeNumber,
    sanitizePublicAssetPath,
    sanitizeText,
} from "../utils/security";

async function fetchItems(path) {
    try {
        const res = await fetch(path, { credentials: "same-origin" });

        if (!res.ok) {
            console.error(`Impossible de charger ${path}:`, res.status);
            return [];
        }

        const data = await res.json();
        return Array.isArray(data?.items) ? data.items : [];
    } catch (error) {
        console.error(`Erreur lors du chargement de ${path}:`, error);
        return [];
    }
}

async function fetchContent(path, fallback) {
    try {
        const res = await fetch(path, { credentials: "same-origin" });

        if (!res.ok) {
            console.error(`Impossible de charger ${path}:`, res.status);
            return fallback;
        }

        return await res.json();
    } catch (error) {
        console.error(`Erreur lors du chargement de ${path}:`, error);
        return fallback;
    }
}

function slugifyText(value) {
    if (typeof value !== "string") return null;

    const normalized = value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 64);

    return normalized || null;
}

function sanitizeTextList(values, maxLength = 220) {
    if (!Array.isArray(values)) return [];

    return values
        .map((value) => sanitizeText(value, maxLength))
        .filter((value) => value.length > 0);
}

function sanitizeLinkItem(item) {
    const id = sanitizeId(item?.id) || slugifyText(sanitizeText(item?.label, 80));
    const to = sanitizeInternalPath(item?.to);

    if (!id || !to) return null;

    return {
        id,
        label: sanitizeText(item?.label, 80),
        to,
    };
}

function sanitizeCmsContentItem(item) {
    const id = sanitizeId(item?.id) || slugifyText(sanitizeText(item?.title, 120));
    if (!id) return null;

    return {
        id,
        title: sanitizeText(item?.title, 120),
        description: sanitizeText(item?.description, 320),
    };
}

function sanitizeHeroContent(hero) {
    return {
        eyebrow: sanitizeText(hero?.eyebrow, 80),
        title: sanitizeText(hero?.title, 160),
        description: sanitizeText(hero?.description, 420),
        primaryCta: sanitizeLinkItem(hero?.primaryCta),
        secondaryCta: sanitizeLinkItem(hero?.secondaryCta),
    };
}

function sanitizeQuickLink(item) {
    const base = sanitizeCmsContentItem(item);
    const to = sanitizeInternalPath(item?.to);

    if (!base || !to) return null;

    return {
        ...base,
        to,
        badge: sanitizeText(item?.badge, 40),
    };
}

function sanitizeHighlight(item) {
    const base = sanitizeCmsContentItem(item);
    if (!base) return null;

    return {
        ...base,
        value: sanitizeText(item?.value, 60),
        tag: sanitizeText(item?.tag, 60),
    };
}

function sanitizeGuideSection(section) {
    const id = sanitizeId(section?.id) || slugifyText(sanitizeText(section?.title, 120));
    if (!id) return null;

    const items = Array.isArray(section?.items)
        ? section.items
              .map(sanitizeCmsContentItem)
              .filter(Boolean)
        : [];

    const links = Array.isArray(section?.links)
        ? section.links.map(sanitizeLinkItem).filter(Boolean)
        : [];

    return {
        id,
        title: sanitizeText(section?.title, 120),
        summary: sanitizeText(section?.summary, 360),
        items,
        links,
    };
}

function sanitizeContact(item) {
    const id = sanitizeId(item?.id) || slugifyText(sanitizeText(item?.name, 120));
    if (!id) return null;

    return {
        id,
        name: sanitizeText(item?.name, 120),
        role: sanitizeText(item?.role, 80),
        description: sanitizeText(item?.description, 260),
        phone: sanitizeText(item?.phone, 40),
        email: sanitizeText(item?.email, 120),
        address: sanitizeText(item?.address, 220),
        hours: sanitizeText(item?.hours, 160),
    };
}

function sanitizeSiteContent(data) {
    return {
        hero: sanitizeHeroContent(data?.hero || {}),
        quickLinks: Array.isArray(data?.quickLinks)
            ? data.quickLinks.map(sanitizeQuickLink).filter(Boolean)
            : [],
        highlights: Array.isArray(data?.highlights)
            ? data.highlights.map(sanitizeHighlight).filter(Boolean)
            : [],
        guideSections: Array.isArray(data?.guideSections)
            ? data.guideSections.map(sanitizeGuideSection).filter(Boolean)
            : [],
        contacts: Array.isArray(data?.contacts)
            ? data.contacts.map(sanitizeContact).filter(Boolean)
            : [],
        visitorTips: sanitizeTextList(data?.visitorTips, 220),
        alerts: sanitizeTextList(data?.alerts, 220),
    };
}

function sanitizeNewsItem(item) {
    const id = sanitizeId(item?.id);
    if (!id) return null;

    return {
        id,
        title: sanitizeText(item?.title, 160),
        date: sanitizeDate(item?.date),
        excerpt: sanitizeText(item?.excerpt, 280),
        content: sanitizeText(item?.content, 5000),
        image: sanitizePublicAssetPath(item?.image, {
            allowedPrefixes: ["/uploads/"],
            allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
        }),
    };
}

function sanitizeEventItem(item) {
    const id = sanitizeId(item?.id);
    if (!id) return null;

    return {
        id,
        title: sanitizeText(item?.title, 160),
        startDate: sanitizeDate(item?.startDate),
        endDate: sanitizeDate(item?.endDate),
        date: sanitizeDate(item?.date),
        location: sanitizeText(item?.location, 200),
        content: sanitizeText(item?.content, 5000),
        image: sanitizePublicAssetPath(item?.image, {
            allowedPrefixes: ["/uploads/"],
            allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
        }),
    };
}

function sanitizeHikeItem(item) {
    const id = sanitizeId(item?.id);
    if (!id) return null;

    return {
        id,
        name: sanitizeText(item?.name, 160),
        distance: sanitizeNumber(item?.distance, { min: 0, max: 250 }),
        difficulty: sanitizeText(item?.difficulty, 40),
        duration: sanitizeText(item?.duration, 40),
        lat: sanitizeNumber(item?.lat, { min: -90, max: 90 }),
        lng: sanitizeNumber(item?.lng, { min: -180, max: 180 }),
        description: sanitizeText(item?.description, 1200),
        startPoint: sanitizeText(item?.startPoint, 200),
        gpx: sanitizePublicAssetPath(item?.gpx, {
            allowedPrefixes: ["/gpx/"],
            allowedExtensions: [".gpx"],
        }),
    };
}

function sanitizeParkingItem(item) {
    const id = sanitizeId(item?.id);
    if (!id) return null;

    return {
        id,
        name: sanitizeText(item?.name, 160),
        lat: sanitizeNumber(item?.lat, { min: -90, max: 90 }),
        lng: sanitizeNumber(item?.lng, { min: -180, max: 180 }),
        address: sanitizeText(item?.address, 220),
        cars: sanitizeBoolean(item?.cars),
        minivans: sanitizeBoolean(item?.minivans),
        motorcycles: sanitizeBoolean(item?.motorcycles),
        campers: sanitizeBoolean(item?.campers),
        hourlyRate: sanitizeText(item?.hourlyRate, 60),
        dailyRate: sanitizeText(item?.dailyRate, 60),
        notes: sanitizeText(item?.notes, 400),
    };
}

export async function getNews() {
    const items = await fetchItems("/content/news/news.json");
    return items.map(sanitizeNewsItem).filter(Boolean);
}

export async function getEvents() {
    const items = await fetchItems("/content/events/events.json");
    return items.map(sanitizeEventItem).filter(Boolean);
}

export async function getHikes() {
    const items = await fetchItems("/content/hikes/hikes.json");
    return items.map(sanitizeHikeItem).filter(Boolean);
}

export async function getParkings() {
    const items = await fetchItems("/content/parkings/parkings.json");
    return items.map(sanitizeParkingItem).filter(Boolean);
}

export async function getSectionVisibility() {
    const defaults = {
        guide: true,
        events: true,
        news: true,
        hikes: true,
        parkings: true,
    };
    const data = await fetchContent("/content/site/sections.json", defaults);

    return {
        guide: data?.guide !== false,
        events: data?.events !== false,
        news: data?.news !== false,
        hikes: data?.hikes !== false,
        parkings: data?.parkings !== false,
    };
}

export async function getSiteContent() {
    const fallback = {
        hero: {
            eyebrow: "",
            title: "",
            description: "",
            primaryCta: null,
            secondaryCta: null,
        },
        quickLinks: [],
        highlights: [],
        guideSections: [],
        contacts: [],
        visitorTips: [],
        alerts: [],
    };
    const data = await fetchContent("/content/site/site.json", fallback);

    return sanitizeSiteContent(data);
}
