import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { hasValidCoordinates } from "../utils/security";

function FitBounds({ parkings }) {
    const map = useMap();

    useEffect(() => {
        if (!parkings.length) return;

        const bounds = L.latLngBounds(
            parkings
                .filter((parking) => Number.isFinite(parking.lat) && Number.isFinite(parking.lng))
                .map((parking) => [parking.lat, parking.lng])
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
    const mappableParkings = parkings.filter(hasValidCoordinates);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <MapContainer
                center={[43.9221, 5.1278]}
                zoom={14}
                scrollWheelZoom
                className="h-[360px] w-full sm:h-[420px] lg:h-[520px]"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds parkings={mappableParkings} />

                {mappableParkings.map((parking) => (
                    <Marker key={parking.id} position={[parking.lat, parking.lng]}>
                        <Popup>
                            <div className="min-w-[220px] text-sm">
                                <h3 className="mb-2 text-base font-bold">{parking.name}</h3>
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
