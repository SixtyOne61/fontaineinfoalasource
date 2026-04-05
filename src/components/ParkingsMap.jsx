import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

function FitBounds({ parkings }) {
    const map = useMap();

    useEffect(() => {
        if (!parkings.length) return;

        const bounds = L.latLngBounds(
            parkings
                .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
                .map((p) => [p.lat, p.lng])
        );

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [30, 30] });
        }
    }, [parkings, map]);

    return null;
}

function yesNo(value) {
    return value ? "Oui" : "Non";
}

export default function ParkingsMap({ parkings }) {
    const defaultCenter = [43.9221, 5.1278];

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
            <MapContainer
                center={defaultCenter}
                zoom={14}
                scrollWheelZoom={true}
                className="h-[360px] sm:h-[420px] lg:h-[520px] w-full"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds parkings={parkings} />

                {parkings.map((parking) => (
                    <Marker key={parking.id} position={[parking.lat, parking.lng]}>
                        <Popup>
                            <div className="min-w-[220px] text-sm">
                                <h3 className="font-bold text-base mb-2">{parking.name}</h3>
                                <p><strong>Adresse :</strong> {parking.address}</p>
                                <p><strong>Voitures :</strong> {yesNo(parking.cars)}</p>
                                <p><strong>Motos :</strong> {yesNo(parking.motorcycles)}</p>
                                <p><strong>Camping-cars :</strong> {yesNo(parking.campers)}</p>
                                <p><strong>Tarif horaire :</strong> {parking.hourlyRate}</p>
                                <p><strong>Tarif journée :</strong> {parking.dailyRate}</p>
                                {parking.notes && (
                                    <p className="mt-2 text-slate-600">{parking.notes}</p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}