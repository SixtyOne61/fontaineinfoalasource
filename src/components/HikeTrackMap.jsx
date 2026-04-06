import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";
import { loadGpxTrackData } from "../utils/gpx";
import { hasValidCoordinates } from "../utils/security";

function FitTrackBounds({ track, fallbackPosition }) {
    const map = useMap();

    useEffect(() => {
        if (track.length > 1) {
            const bounds = L.latLngBounds(track);
            map.fitBounds(bounds, { padding: [30, 30] });
        } else if (fallbackPosition) {
            map.setView(fallbackPosition, 14);
        }
    }, [track, fallbackPosition, map]);

    return null;
}

export default function HikeTrackMap({ hike }) {
    const { lang } = useLocale();
    const [track, setTrack] = useState([]);

    useEffect(() => {
        let isMounted = true;

        async function loadTrack() {
            if (!hike?.gpx) {
                setTrack([]);
                return;
            }

            const data = await loadGpxTrackData(hike.gpx);

            if (isMounted) {
                setTrack(data.track);
            }
        }

        loadTrack();

        return () => {
            isMounted = false;
        };
    }, [hike]);

    if (!hike || !hasValidCoordinates(hike)) {
        return null;
    }

    const fallbackPosition = [hike.lat, hike.lng];

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <MapContainer
                center={fallbackPosition}
                zoom={14}
                scrollWheelZoom
                className="h-[500px] w-full"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitTrackBounds track={track} fallbackPosition={fallbackPosition} />

                {track.length > 1 && (
                    <Polyline
                        positions={track}
                        pathOptions={{ color: "#1f5e54", weight: 5, opacity: 0.9 }}
                    />
                )}

                <Marker position={fallbackPosition}>
                    <Popup>
                        <div className="min-w-[200px]">
                            <h3 className="font-bold">{getLocalizedField(hike, "name", lang)}</h3>
                            <p>{lang === "en" ? "Start:" : "Départ :"} {getLocalizedField(hike, "startPoint", lang)}</p>
                            <p>{lang === "en" ? "Distance:" : "Distance :"} {hike.distance} km</p>
                            <p>{lang === "en" ? "Difficulty:" : "Difficulté :"} {getLocalizedField(hike, "difficulty", lang)}</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
