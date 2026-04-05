import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

function FitBounds({ hikes }) {
    const map = useMap();

    useEffect(() => {
        if (!hikes.length) return;

        const bounds = L.latLngBounds(hikes.map((hike) => [hike.lat, hike.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
    }, [hikes, map]);

    return null;
}

export default function HikesMap({ hikes }) {
    const defaultCenter = [45.7342, 4.8148];

    return (
        <div className="overflow-hidden rounded-2xl shadow-lg border border-slate-200">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                scrollWheelZoom={true}
                className="h-[500px] w-full"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds hikes={hikes} />

                {hikes.map((hike) => {
                    const googleMapsUrl = `https://www.google.com/maps?q=${hike.lat},${hike.lng}`;
                    const osmUrl = `https://www.openstreetmap.org/?mlat=${hike.lat}&mlon=${hike.lng}#map=15/${hike.lat}/${hike.lng}`;

                    return (
                        <Marker key={hike.id} position={[hike.lat, hike.lng]}>
                            <Popup>
                                <div className="min-w-[240px]">
                                    <h3 className="text-base font-bold mb-2">{hike.name}</h3>
                                    <p><strong>Distance :</strong> {hike.distance} km</p>
                                    <p><strong>Difficulté :</strong> {hike.difficulty}</p>
                                    <p><strong>Durée :</strong> {hike.duration}</p>
                                    <p><strong>Départ :</strong> {hike.startPoint}</p>
                                    <p className="mt-2 text-sm text-slate-700">{hike.description}</p>

                                    <div className="mt-3 flex flex-col gap-1">
                                        <a
                                            href={googleMapsUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            Ouvrir dans Google Maps
                                        </a>
                                        <a
                                            href={osmUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            Ouvrir dans OpenStreetMap
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}