import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./index.css";

import AppRoutes from "./AppRoutes";
import FixLeafletIcon from "./components/FixLeafletIcon";
import LocaleProvider from "./LocaleProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <LocaleProvider>
            <BrowserRouter>
                <FixLeafletIcon />
                <AppRoutes />
            </BrowserRouter>
        </LocaleProvider>
    </React.StrictMode>
);
