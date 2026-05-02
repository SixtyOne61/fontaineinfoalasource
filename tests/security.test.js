import assert from "node:assert/strict";
import {
    sanitizeInternalPath,
    sanitizePublicAssetPath,
    sanitizeText,
} from "../src/utils/security.js";

export default [
    {
        name: "sanitizeText trims and collapses whitespace",
        run() {
            assert.equal(sanitizeText("  Bonjour \n  Fontaine   "), "Bonjour Fontaine");
        },
    },
    {
        name: "sanitizeInternalPath accepts safe in-app routes",
        run() {
            assert.equal(sanitizeInternalPath("/events/marche-local"), "/events/marche-local");
        },
    },
    {
        name: "sanitizeInternalPath rejects traversal and protocol-relative values",
        run() {
            assert.equal(sanitizeInternalPath("../events"), null);
            assert.equal(sanitizeInternalPath("//evil.example"), null);
            assert.equal(sanitizeInternalPath("/guide/../admin"), null);
        },
    },
    {
        name: "sanitizePublicAssetPath keeps only allowed prefixes and extensions",
        run() {
            assert.equal(
                sanitizePublicAssetPath("/uploads/visuel.jpg", {
                    allowedPrefixes: ["/uploads/"],
                    allowedExtensions: [".jpg", ".png"],
                }),
                "/uploads/visuel.jpg"
            );
            assert.equal(
                sanitizePublicAssetPath("/gpx/belvedere.gpx", {
                    allowedPrefixes: ["/uploads/"],
                    allowedExtensions: [".gpx"],
                }),
                null
            );
        },
    },
    {
        name: "sanitizePublicAssetPath rejects unsafe or disguised paths",
        run() {
            assert.equal(
                sanitizePublicAssetPath("/uploads/../../secret.jpg", {
                    allowedPrefixes: ["/uploads/"],
                    allowedExtensions: [".jpg"],
                }),
                null
            );
            assert.equal(
                sanitizePublicAssetPath("/uploads/plan.jpg?dl=1", {
                    allowedPrefixes: ["/uploads/"],
                    allowedExtensions: [".png"],
                }),
                null
            );
        },
    },
];
