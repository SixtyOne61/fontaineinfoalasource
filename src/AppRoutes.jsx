import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AsyncStateCard from "./components/AsyncStateCard";
import { getSectionVisibility } from "./data/loader";

const Home = lazy(() => import("./pages/Home"));
const Guide = lazy(() => import("./pages/Guide"));
const News = lazy(() => import("./pages/News"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Hikes = lazy(() => import("./pages/Hikes"));
const HikeDetail = lazy(() => import("./pages/HikeDetail"));
const Parking = lazy(() => import("./pages/Parking"));
const Photos = lazy(() => import("./pages/Photos"));

function RouteLoadingState() {
    return (
        <AsyncStateCard
            title="Chargement"
            description="La page demandee est en cours de preparation."
        />
    );
}

export default function AppRoutes() {
    const [sectionVisibility, setSectionVisibility] = useState(null);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        let isMounted = true;

        async function syncSectionVisibility() {
            try {
                const visibility = await getSectionVisibility();

                if (!isMounted) return;

                setSectionVisibility(visibility);
                setStatus("ready");
            } catch (error) {
                console.error("Unable to load section visibility:", error);

                if (isMounted) {
                    setStatus("error");
                }
            }
        }

        syncSectionVisibility();

        return () => {
            isMounted = false;
        };
    }, []);

    if (status === "error") {
        return (
            <AsyncStateCard
                title="Chargement impossible"
                description="Les sections du site ne sont pas disponibles pour le moment."
            />
        );
    }

    if (status === "loading" || !sectionVisibility) {
        return (
            <AsyncStateCard
                title="Chargement"
                description="Les sections du site sont en cours de chargement."
            />
        );
    }

    return (
        <Suspense fallback={<RouteLoadingState />}>
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
                <Route
                    path="/photos"
                    element={sectionVisibility.photos ? <Photos /> : <Navigate to="/" replace />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}
