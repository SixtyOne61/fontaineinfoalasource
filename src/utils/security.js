const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;
const SAFE_INTERNAL_PATH_RE = /^\/[A-Za-z0-9._~!$&'()*+,;=:@%/?#-]*$/;
const MAX_TEXT_LENGTH = 5000;

function clampText(value, maxLength = MAX_TEXT_LENGTH) {
    if (typeof value !== "string") return "";

    const normalized = value.replace(/\s+/g, " ").trim();
    return normalized.slice(0, maxLength);
}

function hasUnsafePathCharacters(value) {
    for (const char of value) {
        const code = char.charCodeAt(0);
        if (char === "\\" || code <= 31) {
            return true;
        }
    }

    return false;
}

export function sanitizeId(value) {
    if (typeof value === "number" && Number.isSafeInteger(value)) {
        return String(value);
    }

    if (typeof value === "string") {
        const normalized = value.trim();
        return SAFE_ID_RE.test(normalized) ? normalized : null;
    }

    return null;
}

export function sanitizeText(value, maxLength) {
    return clampText(value, maxLength);
}

export function sanitizeDate(value) {
    if (typeof value !== "string") return "";

    const normalized = value.trim();
    return ISO_DATE_RE.test(normalized) ? normalized : "";
}

export function sanitizeBoolean(value) {
    return value === true;
}

export function sanitizeNumber(value, { min = -Infinity, max = Infinity } = {}) {
    const parsed = typeof value === "number" ? value : Number.parseFloat(value);

    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
        return null;
    }

    return parsed;
}

export function sanitizeInternalPath(value) {
    if (typeof value !== "string") return null;

    const normalized = value.trim();
    if (!normalized.startsWith("/") || normalized.startsWith("//")) {
        return null;
    }

    if (normalized.includes("..") || normalized.includes("\\") || /\s/.test(normalized)) {
        return null;
    }

    return SAFE_INTERNAL_PATH_RE.test(normalized) ? normalized : null;
}

export function hasValidCoordinates(item) {
    return Number.isFinite(item?.lat) && Number.isFinite(item?.lng);
}

export function sanitizePublicAssetPath(
    value,
    {
        allowedPrefixes = ["/"],
        allowedExtensions = [],
    } = {}
) {
    if (typeof value !== "string") return null;

    const normalized = value.trim();
    if (!normalized.startsWith("/") || normalized.startsWith("//")) {
        return null;
    }

    if (hasUnsafePathCharacters(normalized) || normalized.includes("..")) {
        return null;
    }

    try {
        const url = new URL(normalized, "https://fontaine.local");

        if (url.origin !== "https://fontaine.local") {
            return null;
        }

        if (!allowedPrefixes.some((prefix) => url.pathname.startsWith(prefix))) {
            return null;
        }

        if (
            allowedExtensions.length > 0 &&
            !allowedExtensions.some((extension) =>
                url.pathname.toLowerCase().endsWith(extension)
            )
        ) {
            return null;
        }

        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return null;
    }
}
