import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { getLocalizedField } from "../locale";
import ParkingAddressActions from "./ParkingAddressActions";
import { useLocale } from "../useLocale";
import { hasValidCoordinates } from "../utils/security";

const vehicleTypes = {
    fr: [
        { key: "motorcycles", label: "Moto" },
        { key: "cars", label: "Voiture" },
        { key: "minivans", label: "Mini-van" },
        { key: "campers", label: "Camping-car" },
    ],
    en: [
        { key: "motorcycles", label: "Motorbike" },
        { key: "cars", label: "Car" },
        { key: "minivans", label: "Minivan" },
        { key: "campers", label: "Motorhome" },
    ],
};

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
    const { lang } = useLocale();
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
                                <h3 className="mb-2 text-base font-bold">{getLocalizedField(parking, "name", lang)}</h3>
                                <div>
                                    <strong>{lang === "en" ? "Address:" : "Adresse :"}</strong>
                                    <div className="mt-1">
                                        <ParkingAddressActions parking={parking} lang={lang} compact />
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {vehicleTypes[lang].map((vehicle) => (
                                        <VehiclePill
                                            key={vehicle.key}
                                            label={vehicle.label}
                                            allowed={parking[vehicle.key]}
                                        />
                                    ))}
                                </div>
                                <p className="mt-3"><strong>{lang === "en" ? "Hourly rate:" : "Tarif horaire :"}</strong> {getLocalizedField(parking, "hourlyRate", lang)}</p>
                                <p><strong>{lang === "en" ? "Daily rate:" : "Tarif journée :"}</strong> {getLocalizedField(parking, "dailyRate", lang)}</p>
                                {getLocalizedField(parking, "notes", lang) && (
                                    <p className="mt-2 text-slate-600">{getLocalizedField(parking, "notes", lang)}</p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
