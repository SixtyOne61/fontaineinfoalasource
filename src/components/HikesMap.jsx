import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

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

                {hikes.map((hike) => (
                    <Marker key={hike.id} position={[hike.lat, hike.lng]}>
                        <Popup>
                            <div className="min-w-[220px]">
                                <h3 className="text-base font-bold mb-1">{hike.name}</h3>
                                <p><strong>Distance :</strong> {hike.distance} km</p>
                                <p><strong>Difficulté :</strong> {hike.difficulty}</p>
                                <p><strong>Durée :</strong> {hike.duration}</p>
                                <p><strong>Départ :</strong> {hike.startPoint}</p>
                                <p className="mt-2 text-sm text-slate-700">{hike.description}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}