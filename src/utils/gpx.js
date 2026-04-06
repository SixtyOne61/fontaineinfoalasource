import { sanitizePublicAssetPath } from "./security";

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function loadGpxTrackData(gpxUrl) {
    const safeGpxUrl = sanitizePublicAssetPath(gpxUrl, {
        allowedPrefixes: ["/gpx/"],
        allowedExtensions: [".gpx"],
    });

    if (!safeGpxUrl) {
        return {
            track: [],
            elevationProfile: [],
            minElevation: null,
            maxElevation: null,
        };
    }

    try {
        const response = await fetch(safeGpxUrl, { credentials: "same-origin" });

        if (!response.ok) {
            console.error("Impossible de charger le GPX :", safeGpxUrl, response.status);
            return {
                track: [],
                elevationProfile: [],
                minElevation: null,
                maxElevation: null,
            };
        }

        const gpxText = await response.text();
        if (gpxText.length > 2_000_000) {
            console.error("Fichier GPX trop volumineux :", safeGpxUrl);
            return {
                track: [],
                elevationProfile: [],
                minElevation: null,
                maxElevation: null,
            };
        }

        const parser = new DOMParser();
        const xml = parser.parseFromString(gpxText, "application/xml");

        const parserError = xml.querySelector("parsererror");
        if (parserError) {
            console.error("Erreur de parsing GPX :", parserError.textContent);
            return {
                track: [],
                elevationProfile: [],
                minElevation: null,
                maxElevation: null,
            };
        }

        const trackPoints = Array.from(xml.querySelectorAll("trkpt"));
        const routePoints = Array.from(xml.querySelectorAll("rtept"));
        const rawPoints = trackPoints.length > 0 ? trackPoints : routePoints;

        const parsedPoints = rawPoints
            .map((point) => {
                const lat = parseFloat(point.getAttribute("lat"));
                const lng = parseFloat(point.getAttribute("lon"));
                const eleNode = point.querySelector("ele");
                const elevation = eleNode ? parseFloat(eleNode.textContent) : null;

                return {
                    lat,
                    lng,
                    elevation: Number.isFinite(elevation) ? elevation : null,
                };
            })
            .filter(
                (point) => Number.isFinite(point.lat) && Number.isFinite(point.lng)
            );

        const track = parsedPoints.map((point) => [point.lat, point.lng]);

        let cumulativeDistance = 0;
        const elevationProfile = [];

        for (let i = 0; i < parsedPoints.length; i++) {
            const current = parsedPoints[i];
            const previous = parsedPoints[i - 1];

            if (previous) {
                cumulativeDistance += haversineDistance(
                    previous.lat,
                    previous.lng,
                    current.lat,
                    current.lng
                );
            }

            if (current.elevation !== null) {
                elevationProfile.push({
                    distance: Number(cumulativeDistance.toFixed(2)),
                    elevation: current.elevation,
                });
            }
        }

        const elevations = elevationProfile.map((point) => point.elevation);
        const minElevation = elevations.length ? Math.min(...elevations) : null;
        const maxElevation = elevations.length ? Math.max(...elevations) : null;

        return {
            track,
            elevationProfile,
            minElevation,
            maxElevation,
        };
    } catch (error) {
        console.error("Erreur lors du chargement du GPX :", error);
        return {
            track: [],
            elevationProfile: [],
            minElevation: null,
            maxElevation: null,
        };
    }
}
