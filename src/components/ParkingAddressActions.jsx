import { useEffect, useState } from "react";
import { getLocalizedField } from "../locale";

function buildParkingQuery(parking, lang) {
    const name = getLocalizedField(parking, "name", lang);
    const address = getLocalizedField(parking, "address", lang);

    if (Number.isFinite(parking?.lat) && Number.isFinite(parking?.lng)) {
        return `${parking.lat},${parking.lng} (${name})`;
    }

    return [name, address].filter(Boolean).join(", ");
}

export default function ParkingAddressActions({ parking, lang, compact = false }) {
    const [copyState, setCopyState] = useState("idle");
    const address = getLocalizedField(parking, "address", lang);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildParkingQuery(parking, lang))}`;

    useEffect(() => {
        if (copyState === "idle") return undefined;

        const timeoutId = window.setTimeout(() => {
            setCopyState("idle");
        }, 1800);

        return () => window.clearTimeout(timeoutId);
    }, [copyState]);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(address);
            setCopyState("copied");
        } catch {
            setCopyState("error");
        }
    }

    return (
        <div className={`flex ${compact ? "items-center gap-2" : "items-start gap-3"}`}>
            <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className={`text-[#1f5e54] underline decoration-[#a7cfc1] underline-offset-2 hover:text-[#163c35] ${
                    compact ? "" : "text-sm sm:text-base"
                }`}
            >
                {address}
            </a>
            <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-full border border-[#cfe3db] bg-white px-3 py-1 text-xs font-semibold text-[#1f5e54] transition hover:border-[#1f5e54] hover:text-[#163c35]"
            >
                {copyState === "copied"
                    ? lang === "en" ? "Copied" : "Copié"
                    : copyState === "error"
                        ? lang === "en" ? "Retry" : "Réessayer"
                        : lang === "en" ? "Copy" : "Copier"}
            </button>
        </div>
    );
}
