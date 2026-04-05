export async function loadGpxTrack(gpxUrl) {
    if (!gpxUrl) return [];

    try {
        const response = await fetch(gpxUrl);
        const gpxText = await response.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(gpxText, "application/xml");

        const points = Array.from(xml.getElementsByTagName("trkpt")).map((point) => {
            const lat = parseFloat(point.getAttribute("lat"));
            const lng = parseFloat(point.getAttribute("lon"));
            return [lat, lng];
        });

        return points.filter(
            ([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng)
        );
    } catch (error) {
        console.error("Erreur lors du chargement du GPX :", error);
        return [];
    }
}