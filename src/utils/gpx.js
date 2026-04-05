export async function loadGpxTrack(gpxUrl) {
    if (!gpxUrl) return [];

    try {
        const response = await fetch(gpxUrl);

        if (!response.ok) {
            console.error("Impossible de charger le GPX :", gpxUrl, response.status);
            return [];
        }

        const gpxText = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(gpxText, "application/xml");

        const parserError = xml.querySelector("parsererror");
        if (parserError) {
            console.error("Erreur de parsing GPX :", parserError.textContent);
            return [];
        }

        const trackPoints = Array.from(xml.querySelectorAll("trkpt"));
        const routePoints = Array.from(xml.querySelectorAll("rtept"));

        const rawPoints = trackPoints.length > 0 ? trackPoints : routePoints;

        const points = rawPoints
            .map((point) => {
                const lat = parseFloat(point.getAttribute("lat"));
                const lng = parseFloat(point.getAttribute("lon"));
                return [lat, lng];
            })
            .filter(
                ([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng)
            );

        return points;
    } catch (error) {
        console.error("Erreur lors du chargement du GPX :", error);
        return [];
    }
}