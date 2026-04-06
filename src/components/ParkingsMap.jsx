import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { hasValidCoordinates } from "../utils/security";

const vehicleTypes = [
    { key: "motorcycles", label: "Moto" },
    { key: "cars", label: "Voiture" },
    { key: "minivans", label: "Mini-van" },
    { key: "campers", label: "Camping-car" },
];

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

function VehiclePill({ label, allowed }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                allowed
                    ? "bg-[#eef7f3] text-[#1f5e54]"
                    : "bg-slate-100 text-slate-500 line-through decoration-slate-400"
            }`}
        >
            {label}
        </span>
    );
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
                            <div className="min-w-[240px] text-sm">
                                <h3 className="mb-2 text-base font-bold">{parking.name}</h3>
                                <p><strong>Adresse :</strong> {parking.address}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {vehicleTypes.map((vehicle) => (
                                        <VehiclePill
                                            key={vehicle.key}
                                            label={vehicle.label}
                                            allowed={parking[vehicle.key]}
                                        />
                                    ))}
                                </div>
                                <p className="mt-3"><strong>Tarif horaire :</strong> {parking.hourlyRate}</p>
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
