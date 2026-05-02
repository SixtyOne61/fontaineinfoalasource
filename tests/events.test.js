import assert from "node:assert/strict";
import {
    expandRecurringEvents,
    getDatesInRange,
    getRecurrenceLabel,
    parseLocalDate,
} from "../src/utils/events.js";

export default [
    {
        name: "parseLocalDate returns a normalized local date",
        run() {
            const date = parseLocalDate("2026-05-02");

            assert.ok(date instanceof Date);
            assert.equal(date.getFullYear(), 2026);
            assert.equal(date.getMonth(), 4);
            assert.equal(date.getDate(), 2);
            assert.equal(date.getHours(), 0);
        },
    },
    {
        name: "expandRecurringEvents expands weekly recurrence until the end date",
        run() {
            const events = expandRecurringEvents([
                {
                    id: "marche",
                    title: "Marche locale",
                    startDate: "2026-05-04",
                    endDate: "2026-05-04",
                    date: "2026-05-04",
                    recurrence: {
                        frequency: "weekly",
                        interval: 1,
                        until: "2026-05-18",
                        weekdays: ["monday"],
                    },
                },
            ]);

            assert.deepEqual(
                events.map((event) => event.startDate),
                ["2026-05-04", "2026-05-11", "2026-05-18"]
            );
            assert.equal(events[1].baseEventId, "marche");
            assert.equal(events[2].occurrenceIndex, 2);
        },
    },
    {
        name: "getDatesInRange includes every date in the inclusive span",
        run() {
            assert.deepEqual(getDatesInRange("2026-07-10", "2026-07-12"), [
                "2026-07-10",
                "2026-07-11",
                "2026-07-12",
            ]);
        },
    },
    {
        name: "getRecurrenceLabel formats weekdays in French and English",
        run() {
            const event = {
                startDate: "2026-05-05",
                recurrence: {
                    frequency: "weekly",
                    interval: 1,
                    until: "2026-06-30",
                    weekdays: ["tuesday", "thursday"],
                },
            };

            assert.equal(
                getRecurrenceLabel(event, "fr"),
                "Chaque semaine le mardi et jeudi jusqu'au 30/06/2026"
            );
            assert.equal(
                getRecurrenceLabel(event, "en"),
                "Every week on Tuesday and Thursday until 30/06/2026"
            );
        },
    },
];
