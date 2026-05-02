import {
    sanitizeBoolean,
    sanitizeDate,
    sanitizeId,
    sanitizeInternalPath,
    sanitizeNumber,
    sanitizePublicAssetPath,
    sanitizeText,
} from "../utils/security.js";
import { expandRecurringEvents } from "../utils/events.js";

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

function sanitizeLocalizedTextFields(item, field, maxLength) {
    return {
        [field]: sanitizeText(item?.[field], maxLength),
        [`${field}En`]: sanitizeText(item?.[`${field}En`], maxLength),
    };
}

function sanitizeLinkItem(item) {
    const id = sanitizeId(item?.id) || slugifyText(sanitizeText(item?.label, 80));
    const to = sanitizeInternalPath(item?.to);

    if (!id || !to) return null;

    return {
        id,
        ...sanitizeLocalizedTextFields(item, "label", 80),
        to,
    };
}

function sanitizeCmsContentItem(item) {
    const id = sanitizeId(item?.id) || slugifyText(sanitizeText(item?.title, 120));
    if (!id) return null;

    return {
        id,
        ...sanitizeLocalizedTextFields(item, "title", 120),
        ...sanitizeLocalizedTextFields(item, "description", 320),
    };
}

function sanitizeHeroContent(hero) {
    return {
        ...sanitizeLocalizedTextFields(hero, "eyebrow", 80),
        ...sanitizeLocalizedTextFields(hero, "title", 160),
        ...sanitizeLocalizedTextFields(hero, "description", 420),
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
        ...sanitizeLocalizedTextFields(item, "badge", 40),
    };
}

function sanitizeHighlight(item) {
    const base = sanitizeCmsContentItem(item);
    if (!base) return null;

    return {
        ...base,
        ...sanitizeLocalizedTextFields(item, "value", 60),
        ...sanitizeLocalizedTextFields(item, "tag", 60),
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
        ...sanitizeLocalizedTextFields(section, "title", 120),
        ...sanitizeLocalizedTextFields(section, "summary", 360),
        items,
        links,
    };
}

function sanitizeContact(item) {
    const id = sanitizeId(item?.id) || slugifyText(sanitizeText(item?.name, 120));
    if (!id) return null;

    return {
        id,
        ...sanitizeLocalizedTextFields(item, "name", 120),
        ...sanitizeLocalizedTextFields(item, "role", 80),
        ...sanitizeLocalizedTextFields(item, "description", 260),
        phone: sanitizeText(item?.phone, 40),
        email: sanitizeText(item?.email, 120),
        ...sanitizeLocalizedTextFields(item, "address", 220),
        ...sanitizeLocalizedTextFields(item, "hours", 160),
    };
}

function sanitizeDailyInfoItem(item) {
    const id = sanitizeId(item?.id) || slugifyText(sanitizeText(item?.title, 120));
    if (!id || item?.published === false) return null;

    const validUntil = sanitizeDate(item?.validUntil);
    if (validUntil) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(`${validUntil}T00:00:00`);

        if (Number.isFinite(end.getTime()) && end < today) {
            return null;
        }
    }

    const status = sanitizeText(item?.status, 40);
    const statusEn = sanitizeText(item?.statusEn, 40);
    const category = sanitizeText(item?.category, 60);
    const categoryEn = sanitizeText(item?.categoryEn, 60);
    const audience = sanitizeText(item?.audience, 80);
    const audienceEn = sanitizeText(item?.audienceEn, 80);
    const severitySource = `${status} ${statusEn}`.toLowerCase();
    const severity = severitySource.includes("attention")
        ? "warning"
        : severitySource.includes("urgent") || severitySource.includes("priority")
          ? "critical"
          : "info";

    return {
        id,
        ...sanitizeLocalizedTextFields(item, "title", 120),
        message: sanitizeText(item?.summary || item?.message, 320),
        messageEn: sanitizeText(item?.summaryEn || item?.messageEn, 320),
        status,
        statusEn,
        category,
        categoryEn,
        audience,
        audienceEn,
        severity,
        updatedAt: sanitizeDate(item?.updatedAt),
        validUntil,
        cta: item?.ctaTo
            ? {
                  id: `${id}-cta`,
                  label: sanitizeText(item?.ctaLabel, 80),
                  labelEn: sanitizeText(item?.ctaLabelEn, 80),
                  to: sanitizeInternalPath(item?.ctaTo),
              }
            : null,
    };
}

function sanitizePracticalServiceItem(item) {
    const id = sanitizeId(item?.id) || slugifyText(sanitizeText(item?.name || item?.title, 120));
    if (!id || item?.published === false) return null;

    return {
        id,
        title: sanitizeText(item?.name || item?.title, 120),
        titleEn: sanitizeText(item?.nameEn || item?.titleEn, 120),
        description: sanitizeText(
            [item?.summary, item?.details].filter(Boolean).join(" "),
            420
        ),
        descriptionEn: sanitizeText(
            [item?.summaryEn, item?.detailsEn].filter(Boolean).join(" "),
            420
        ),
        tag: sanitizeText(item?.category || item?.tag, 60),
        tagEn: sanitizeText(item?.categoryEn || item?.tagEn, 60),
        audience: sanitizeText(item?.audience, 80),
        audienceEn: sanitizeText(item?.audienceEn, 80),
        ...sanitizeLocalizedTextFields(item, "location", 180),
        ...sanitizeLocalizedTextFields(item, "hours", 180),
        phone: sanitizeText(item?.phone, 40),
        email: sanitizeText(item?.email, 120),
        website: sanitizeText(item?.website, 200),
        updatedAt: sanitizeDate(item?.updatedAt),
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
        dailyInfo: Array.isArray(data?.dailyInfo)
            ? data.dailyInfo.map(sanitizeDailyInfoItem).filter(Boolean)
            : [],
        practicalServices: Array.isArray(data?.practicalServices)
            ? data.practicalServices.map(sanitizePracticalServiceItem).filter(Boolean)
            : [],
        visitorTips: sanitizeTextList(data?.visitorTips, 220),
        visitorTipsEn: sanitizeTextList(data?.visitorTipsEn, 220),
        alerts: sanitizeTextList(data?.alerts, 220),
        alertsEn: sanitizeTextList(data?.alertsEn, 220),
    };
}

function sanitizeNewsItem(item) {
    const id = sanitizeId(item?.id);
    if (!id) return null;

    return {
        id,
        ...sanitizeLocalizedTextFields(item, "title", 160),
        date: sanitizeDate(item?.date),
        ...sanitizeLocalizedTextFields(item, "excerpt", 280),
        ...sanitizeLocalizedTextFields(item, "content", 5000),
        image: sanitizePublicAssetPath(item?.image, {
            allowedPrefixes: ["/uploads/"],
            allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
        }),
    };
}

function sanitizeEventItem(item) {
    const id = sanitizeId(item?.id);
    if (!id) return null;

    const recurrenceFrequency = sanitizeText(item?.recurrence?.frequency, 24).toLowerCase();
    const allowedFrequencies = ["daily", "weekly", "monthly", "weekdays"];
    const recurrenceWeekdays = Array.isArray(item?.recurrence?.weekdays)
        ? item.recurrence.weekdays
              .map((value) => sanitizeText(value, 16).toLowerCase())
              .filter((value) =>
                  ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].includes(value)
              )
        : [];
    const recurrence = allowedFrequencies.includes(recurrenceFrequency)
        ? {
              frequency: recurrenceFrequency,
              interval: sanitizeNumber(item?.recurrence?.interval, { min: 1, max: 31 }) || 1,
              until: sanitizeDate(item?.recurrence?.until),
              endDate: sanitizeDate(item?.recurrence?.endDate),
              weekdays: recurrenceWeekdays,
          }
        : null;

    return {
        id,
        ...sanitizeLocalizedTextFields(item, "title", 160),
        startDate: sanitizeDate(item?.startDate),
        endDate: sanitizeDate(item?.endDate),
        date: sanitizeDate(item?.date),
        location: sanitizeText(item?.location, 200),
        ...sanitizeLocalizedTextFields(item, "content", 5000),
        recurrence,
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
        ...sanitizeLocalizedTextFields(item, "difficulty", 40),
        duration: sanitizeText(item?.duration, 40),
        lat: sanitizeNumber(item?.lat, { min: -90, max: 90 }),
        lng: sanitizeNumber(item?.lng, { min: -180, max: 180 }),
        ...sanitizeLocalizedTextFields(item, "description", 1200),
        ...sanitizeLocalizedTextFields(item, "startPoint", 200),
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
        walkMinutes: sanitizeNumber(item?.walkMinutes, { min: 0, max: 120 }),
        ...sanitizeLocalizedTextFields(item, "walkDistance", 80),
        ...sanitizeLocalizedTextFields(item, "payment", 160),
        ...sanitizeLocalizedTextFields(item, "access", 220),
        ...sanitizeLocalizedTextFields(item, "bestFor", 220),
        ...sanitizeLocalizedTextFields(item, "goodToKnow", 320),
        ...sanitizeLocalizedTextFields(item, "notes", 400),
    };
}

function sanitizePhotoItem(item) {
    const id = sanitizeId(item?.id) || slugifyText(sanitizeText(item?.caption, 80)) || slugifyText(sanitizeText(item?.alt, 80));
    const image = sanitizePublicAssetPath(item?.image, {
        allowedPrefixes: ["/uploads/"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"],
    });

    if (!id || !image) return null;

    return {
        id,
        image,
        ...sanitizeLocalizedTextFields(item, "alt", 160),
        ...sanitizeLocalizedTextFields(item, "caption", 220),
    };
}

function sanitizePhotoGroup(item) {
    const id = sanitizeId(item?.id) || slugifyText(sanitizeText(item?.title, 120));
    if (!id) return null;

    const photos = Array.isArray(item?.photos)
        ? item.photos.map(sanitizePhotoItem).filter(Boolean)
        : [];

    if (photos.length === 0) return null;

    return {
        id,
        ...sanitizeLocalizedTextFields(item, "title", 120),
        ...sanitizeLocalizedTextFields(item, "description", 500),
        photos,
    };
}

export async function getNews() {
    const items = await fetchItems("/content/news/news.json");
    return items.map(sanitizeNewsItem).filter(Boolean);
}

export async function getEvents() {
    const items = await fetchItems("/content/events/events.json");
    return expandRecurringEvents(items.map(sanitizeEventItem).filter(Boolean));
}

export async function getHikes() {
    const items = await fetchItems("/content/hikes/hikes.json");
    return items.map(sanitizeHikeItem).filter(Boolean);
}

export async function getParkings() {
    const items = await fetchItems("/content/parkings/parkings.json");
    return items.map(sanitizeParkingItem).filter(Boolean);
}

export async function getPhotoGroups() {
    const items = await fetchItems("/content/photos/photos.json");
    return items.map(sanitizePhotoGroup).filter(Boolean);
}

export async function getSectionVisibility() {
    const defaults = {
        guide: true,
        events: true,
        news: true,
        hikes: true,
        parkings: true,
        photos: true,
    };
    const data = await fetchContent("/content/site/sections.json", defaults);

    return {
        guide: data?.guide !== false,
        events: data?.events !== false,
        news: data?.news !== false,
        hikes: data?.hikes !== false,
        parkings: data?.parkings !== false,
        photos: data?.photos !== false,
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
        dailyInfo: [],
        practicalServices: [],
        visitorTips: [],
        alerts: [],
    };
    const data = await fetchContent("/content/site/site.json", fallback);

    return sanitizeSiteContent(data);
}
