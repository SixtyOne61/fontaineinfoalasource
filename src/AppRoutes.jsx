import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getSectionVisibility } from "./data/loader";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Guide from "./pages/Guide";
import HikeDetail from "./pages/HikeDetail";
import Hikes from "./pages/Hikes";
import Home from "./pages/Home";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Parking from "./pages/Parking";

export default function AppRoutes() {
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
                path="/guide"
                element={sectionVisibility.guide ? <Guide /> : <Navigate to="/" replace />}
            />
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
