import { useLocale } from "../useLocale";

export default function ElevationChart({
    profile = [],
    minElevation = null,
    maxElevation = null,
}) {
    const { lang } = useLocale();

    if (!profile.length || minElevation === null || maxElevation === null) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
                {lang === "en" ? "No elevation profile available for this hike." : "Aucun dénivelé disponible pour cette randonnée."}
            </div>
        );
    }

    const width = 800;
    const height = 260;
    const padding = 30;

    const maxDistance = profile[profile.length - 1]?.distance || 1;
    const elevationRange = Math.max(maxElevation - minElevation, 1);

    const points = profile.map((point) => {
        const x = padding + (point.distance / maxDistance) * (width - padding * 2);
        const y =
            height -
            padding -
            ((point.elevation - minElevation) / elevationRange) * (height - padding * 2);

        return `${x},${y}`;
    });

    const polylinePoints = points.join(" ");

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-[#163c35]">
                    {lang === "en" ? "Elevation profile" : "Profil altimétrique"}
                </h2>

                <div className="flex gap-4 text-sm text-slate-600">
                    <span>{lang === "en" ? "Min:" : "Min :"} {Math.round(minElevation)} m</span>
                    <span>{lang === "en" ? "Max:" : "Max :"} {Math.round(maxElevation)} m</span>
                    <span>{lang === "en" ? "Range:" : "Amplitude :"} {Math.round(maxElevation - minElevation)} m</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="h-[260px] w-full min-w-[700px]"
                    preserveAspectRatio="none"
                >
                    <line
                        x1={padding}
                        y1={height - padding}
                        x2={width - padding}
                        y2={height - padding}
                        stroke="#94a3b8"
                        strokeWidth="1"
                    />

                    <line
                        x1={padding}
                        y1={padding}
                        x2={padding}
                        y2={height - padding}
                        stroke="#94a3b8"
                        strokeWidth="1"
                    />

                    <polyline
                        fill="none"
                        stroke="#1f5e54"
                        strokeWidth="3"
                        points={polylinePoints}
                    />

                    <text x={padding} y={padding - 8} fontSize="12" fill="#64748b">
                        {Math.round(maxElevation)} m
                    </text>

                    <text x={padding} y={height - padding + 18} fontSize="12" fill="#64748b">
                        0 km
                    </text>

                    <text x={width - padding - 30} y={height - padding + 18} fontSize="12" fill="#64748b">
                        {maxDistance.toFixed(1)} km
                    </text>

                    <text x={padding} y={height - padding + 36} fontSize="12" fill="#64748b">
                        {Math.round(minElevation)} m
                    </text>
                </svg>
            </div>
        </div>
    );
}
