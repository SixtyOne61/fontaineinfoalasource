import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./index.css";

import FixLeafletIcon from "./components/FixLeafletIcon";
import { getSectionVisibility } from "./data/loader";
import { defaultSectionVisibility } from "./data/sections";
import Home from "./pages/Home";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Hikes from "./pages/Hikes";
import HikeDetail from "./pages/HikeDetail";
import Parking from "./pages/Parking";

function AppRoutes() {
    const [sectionVisibility, setSectionVisibility] = useState(null);

    useEffect(() => {
        getSectionVisibility().then(setSectionVisibility);
    }, []);

    if (!sectionVisibility) {
        return null;
    }

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route
                path="/news"
                element={sectionVisibility.news ? <News /> : <Navigate to="/" replace />}
            />
            <Route
                path="/news/:id"
                element={sectionVisibility.news ? <NewsDetail /> : <Navigate to="/" replace />}
            />
            <Route
                path="/events"
                element={sectionVisibility.events ? <Events /> : <Navigate to="/" replace />}
            />
            <Route
                path="/events/:id"
                element={sectionVisibility.events ? <EventDetail /> : <Navigate to="/" replace />}
            />
            <Route
                path="/hikes"
                element={sectionVisibility.hikes ? <Hikes /> : <Navigate to="/" replace />}
            />
            <Route
                path="/hikes/:id"
                element={sectionVisibility.hikes ? <HikeDetail /> : <Navigate to="/" replace />}
            />
            <Route
                path="/parking"
                element={sectionVisibility.parkings ? <Parking /> : <Navigate to="/" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <FixLeafletIcon />
            <AppRoutes />
        </BrowserRouter>
    </React.StrictMode>
);
