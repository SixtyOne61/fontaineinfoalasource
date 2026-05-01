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

function getLocalizedParkingText(parking, field, lang) {
    const localizedKey = lang === "en" ? `${field}En` : field;

    return parking[localizedKey] || parking[field] || "";
}

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

function getWalkSummary(parking, lang) {
    const minutes = Number(parking.walkMinutes);
    const distance = getLocalizedParkingText(parking, "walkDistance", lang);

    if (!minutes && !distance) {
        return "";
    }

    if (minutes && distance) {
        return lang === "en"
            ? `About ${minutes} min on foot (${distance})`
            : `Environ ${minutes} min a pied (${distance})`;
    }

    if (minutes) {
        return lang === "en" ? `About ${minutes} min on foot` : `Environ ${minutes} min a pied`;
    }

    return lang === "en" ? `${distance} on foot` : `${distance} a pied`;
}

function createMarkerIcon(isFeatured) {
    return L.divIcon({
        className: "parking-marker-icon",
        html: `<span style="
            display:flex;
            align-items:center;
            justify-content:center;
            width:18px;
            height:18px;
            border-radius:999px;
            background:${isFeatured ? "#1f5e54" : "#d8c08f"};
            border:2px solid white;
            box-shadow:0 8px 18px rgba(22,60,53,0.24);
        "></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -8],
    });
}

export default function ParkingsMap({ parkings, featuredParkingId = null }) {
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
                    <Marker
                        key={parking.id}
                        position={[parking.lat, parking.lng]}
                        icon={createMarkerIcon(parking.id === featuredParkingId)}
                    >
                        <Popup>
                            <div className="min-w-[240px] text-sm">
                                <h3 className="mb-2 text-base font-bold">{getLocalizedField(parking, "name", lang)}</h3>
                                {getLocalizedParkingText(parking, "bestFor", lang) ? (
                                    <p className="mb-2 text-sm font-medium text-[#1f5e54]">
                                        {getLocalizedParkingText(parking, "bestFor", lang)}
                                    </p>
                                ) : null}
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
                                {getWalkSummary(parking, lang) ? (
                                    <p className="mt-3">
                                        <strong>{lang === "en" ? "Walk:" : "A pied :"}</strong> {getWalkSummary(parking, lang)}
                                    </p>
                                ) : null}
                                {getLocalizedParkingText(parking, "access", lang) ? (
                                    <p>
                                        <strong>{lang === "en" ? "Access:" : "Acces :"}</strong> {getLocalizedParkingText(parking, "access", lang)}
                                    </p>
                                ) : null}
                                <p className="mt-3"><strong>{lang === "en" ? "Hourly rate:" : "Tarif horaire :"}</strong> {getLocalizedField(parking, "hourlyRate", lang)}</p>
                                <p><strong>{lang === "en" ? "Daily rate:" : "Tarif journee :"}</strong> {getLocalizedField(parking, "dailyRate", lang)}</p>
                                {getLocalizedParkingText(parking, "payment", lang) ? (
                                    <p>
                                        <strong>{lang === "en" ? "Payment:" : "Paiement :"}</strong> {getLocalizedParkingText(parking, "payment", lang)}
                                    </p>
                                ) : null}
                                {(getLocalizedParkingText(parking, "goodToKnow", lang) || getLocalizedField(parking, "notes", lang)) ? (
                                    <p className="mt-2 text-slate-600">
                                        {getLocalizedParkingText(parking, "goodToKnow", lang) || getLocalizedField(parking, "notes", lang)}
                                    </p>
                                ) : null}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
