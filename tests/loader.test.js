import assert from "node:assert/strict";
import { getEvents, getParkings, getSectionVisibility } from "../src/data/loader.js";

function createJsonResponse(data, ok = true, status = 200) {
    return {
        ok,
        status,
        async json() {
            return data;
        },
    };
}

export default [
    {
        name: "getParkings keeps bounded practical fields and drops unsafe values",
        async run() {
            const originalFetch = globalThis.fetch;

            globalThis.fetch = async () =>
                createJsonResponse({
                    items: [
                        {
                            id: "centre",
                            name: "Parking centre",
                            lat: 43.9224,
                            lng: 5.1273,
                            address: "Route du village",
                            cars: true,
                            campers: false,
                            walkMinutes: 6,
                            walkDistance: "450 m",
                            payment: "Paiement a l'horodateur",
                            access: "Acces simple en journee",
                            bestFor: "Visite du centre",
                            goodToKnow: "Affluence en milieu de journee",
                            notes: "Eviter les heures de pointe",
                        },
                        {
                            id: "bad one",
                            name: "Ignored parking",
                        },
                    ],
                });

            try {
                const parkings = await getParkings();

                assert.equal(parkings.length, 1);
                assert.equal(parkings[0].id, "centre");
                assert.equal(parkings[0].walkMinutes, 6);
                assert.equal(parkings[0].walkDistance, "450 m");
                assert.equal(parkings[0].payment, "Paiement a l'horodateur");
                assert.equal(parkings[0].bestFor, "Visite du centre");
            } finally {
                globalThis.fetch = originalFetch;
            }
        },
    },
    {
        name: "getSectionVisibility falls back to defaults when fetch fails",
        async run() {
            const originalFetch = globalThis.fetch;

            globalThis.fetch = async () => ({ ok: false, status: 503 });

            try {
                const visibility = await getSectionVisibility();

                assert.deepEqual(visibility, {
                    guide: true,
                    events: true,
                    news: true,
                    hikes: true,
                    parkings: true,
                    photos: true,
                });
            } finally {
                globalThis.fetch = originalFetch;
            }
        },
    },
    {
        name: "getEvents expands recurring entries after sanitization",
        async run() {
            const originalFetch = globalThis.fetch;

            globalThis.fetch = async () =>
                createJsonResponse({
                    items: [
                        {
                            id: "marche-hebdo",
                            title: "Marche hebdo",
                            startDate: "2026-05-06",
                            endDate: "2026-05-06",
                            date: "2026-05-06",
                            location: "Place du village",
                            recurrence: {
                                frequency: "weekly",
                                interval: 1,
                                until: "2026-05-20",
                                weekdays: ["wednesday"],
                            },
                        },
                    ],
                });

            try {
                const events = await getEvents();

                assert.deepEqual(
                    events.map((event) => event.startDate),
                    ["2026-05-06", "2026-05-13", "2026-05-20"]
                );
                assert.equal(events[0].location, "Place du village");
            } finally {
                globalThis.fetch = originalFetch;
            }
        },
    },
];
