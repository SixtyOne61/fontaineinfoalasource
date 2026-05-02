import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    const normalizedId = id.replace(/\\/g, "/");

                    if (!normalizedId.includes("node_modules")) {
                        return null;
                    }

                    if (normalizedId.includes("react-leaflet") || normalizedId.includes("/node_modules/leaflet/")) {
                        return "leaflet";
                    }

                    if (normalizedId.includes("react-router-dom")) {
                        return "router";
                    }

                    if (normalizedId.includes("/node_modules/react/") || normalizedId.includes("scheduler")) {
                        return "react-vendor";
                    }

                    return "vendor";
                },
            },
        },
    },
});
