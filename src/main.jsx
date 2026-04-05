import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./index.css";

import Home from "./pages/Home";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Hikes from "./pages/Hikes";
import HikeDetail from "./pages/HikeDetail";
import Parking from "./pages/Parking";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/hikes" element={<Hikes />} />
                <Route path="/hikes/:id" element={<HikeDetail />} />
                <Route path="/parking" element={<Parking />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);