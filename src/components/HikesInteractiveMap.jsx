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

function MapController({ selectedHike, track, hikes }) {
    const map = useMap();

    useEffect(() => {
        if (track.length > 1) {
            const bounds = L.latLngBounds(track);
            map.fitBounds(bounds, { padding: [30, 30] });
            return;
        }

        if (selectedHike?.lat && selectedHike?.lng) {
            map.setView([selectedHike.lat, selectedHike.lng], 14);
            return;
        }

        if (hikes.length > 0) {
            const bounds = L.latLngBounds(
                hikes
                    .filter((hike) => Number.isFinite(hike.lat) && Number.isFinite(hike.lng))
                    .map((hike) => [hike.lat, hike.lng])
            );

            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [30, 30] });
            }
        }
    }, [map, selectedHike, track, hikes]);

    return null;
}

export default function HikesInteractiveMap({
                                                hikes,
                                                selectedHike,
                                                onMarkerClick,
                                            }) {
    const [track, setTrack] = useState([]);

    useEffect(() => {
        let isMounted = true;

        async function loadTrack() {
            if (!selectedHike?.gpx) {
                setTrack([]);
                return;
            }

            const data = await loadGpxTrackData(selectedHike.gpx);

            if (isMounted) {
                setTrack(data.track || []);
            }
        }

        loadTrack();

        return () => {
            isMounted = false;
        };
    }, [selectedHike]);

    const defaultCenter = [45.7342, 4.8148];

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <div className="px-4 py-3 border-b border-slate-200 bg-[#f6f8f5]">
                <p className="text-sm text-slate-700">
                    {selectedHike
                        ? `Randonnée sélectionnée : ${selectedHike.name}`
                        : "Cliquez sur une randonnée dans la liste ou sur un point de la carte."}
                </p>
            </div>

            <MapContainer
                center={defaultCenter}
                zoom={13}
                scrollWheelZoom={true}
                className="h-[360px] sm:h-[420px] lg:h-[520px] w-full"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController
                    selectedHike={selectedHike}
                    track={track}
                    hikes={hikes}
                />

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

                {hikes.map((hike) => {
                    const isSelected = selectedHike?.id === hike.id;

                    return (
                        <Marker
                            key={hike.id}
                            position={[hike.lat, hike.lng]}
                            eventHandlers={{
                                click: () => onMarkerClick(hike),
                            }}
                        >
                            <Popup>
                                <div className="min-w-[200px]">
                                    <h3 className="font-bold">{hike.name}</h3>
                                    <p>Distance : {hike.distance} km</p>
                                    <p>Difficulté : {hike.difficulty}</p>
                                    <p>Départ : {hike.startPoint}</p>
                                    {isSelected && (
                                        <p className="mt-2 text-sm text-[#1f5e54] font-medium">
                                            Trace affichée sur la carte
                                        </p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}