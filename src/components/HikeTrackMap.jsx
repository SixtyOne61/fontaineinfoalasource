import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import { loadGpxTrackData } from "../utils/gpx";

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

    if (!hike) return null;

    const fallbackPosition = [hike?.lat ?? 45.7342, hike?.lng ?? 4.8148];

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <MapContainer
                center={fallbackPosition}
                zoom={14}
                scrollWheelZoom={true}
                className="h-[500px] w-full"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitTrackBounds track={track} fallbackPosition={fallbackPosition} />

                {track.length > 1 && (
                    <Polyline
                        positions={track}
                        pathOptions={{
                            color: "#1f5e54",
                            weight: 5,
                            opacity: 0.9,
                        }}
                    />
                )}

                <Marker position={fallbackPosition}>
                    <Popup>
                        <div className="min-w-[200px]">
                            <h3 className="font-bold">{hike.name}</h3>
                            <p>Départ : {hike.startPoint}</p>
                            <p>Distance : {hike.distance} km</p>
                            <p>Difficulté : {hike.difficulty}</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}