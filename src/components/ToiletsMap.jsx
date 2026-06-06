import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { getLocalizedField } from "../locale";
import { useLocale } from "../useLocale";
import { hasValidCoordinates } from "../utils/security";
import ToiletAddressActions from "./ToiletAddressActions";

function FitBounds({ toilets }) {
    const map = useMap();

    useEffect(() => {
        if (!toilets.length) return;

        const bounds = L.latLngBounds(toilets.map((toilet) => [toilet.lat, toilet.lng]));

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [30, 30] });
        }
    }, [toilets, map]);

    return null;
}

export default function ToiletsMap({ toilets }) {
    const { lang } = useLocale();
    const mappableToilets = toilets.filter(hasValidCoordinates);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <MapContainer
                center={[43.9221, 5.1278]}
                zoom={15}
                scrollWheelZoom
                className="h-[360px] w-full sm:h-[420px] lg:h-[520px]"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds toilets={mappableToilets} />

                {mappableToilets.map((toilet) => (
                    <Marker key={toilet.id} position={[toilet.lat, toilet.lng]}>
                        <Popup>
                            <div className="min-w-[240px] text-sm">
                                <h3 className="mb-2 text-base font-bold">{getLocalizedField(toilet, "name", lang)}</h3>
                                <ToiletAddressActions toilet={toilet} lang={lang} compact />
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
