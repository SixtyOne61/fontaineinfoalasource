function buildToiletQuery(toilet) {
    const name = toilet?.name;
    const address = toilet?.address;

    if (Number.isFinite(toilet?.lat) && Number.isFinite(toilet?.lng)) {
        return `${toilet.lat},${toilet.lng} (${name})`;
    }

    return [name, address, "Fontaine-de-Vaucluse"].filter(Boolean).join(", ");
}

export default function ToiletAddressActions({ toilet, lang, compact = false, showAddress = true }) {
    const address = toilet?.address || "";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildToiletQuery(toilet))}`;

    return (
        <div className={compact ? "space-y-2" : "space-y-3"}>
            {showAddress && address ? (
                <p className={compact ? "text-xs text-slate-600" : "text-sm text-slate-600"}>{address}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-w-[7.5rem] justify-center rounded-full bg-[#1f5e54] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#18463e]"
                >
                    {lang === "en" ? "Directions" : "Itineraire"}
                </a>
            </div>
        </div>
    );
}
