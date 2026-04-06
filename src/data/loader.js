import {
    sanitizeBoolean,
    sanitizeDate,
    sanitizeId,
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
