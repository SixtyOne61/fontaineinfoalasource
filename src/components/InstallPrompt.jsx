import { useEffect, useMemo, useState } from "react";
import { useLocale } from "../useLocale";

const DISMISS_KEY = "fontaine-install-prompt-dismissed-at";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;

function isStandaloneMode() {
    if (typeof window === "undefined") {
        return false;
    }

    return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
}

function isIosDevice() {
    if (typeof window === "undefined") {
        return false;
    }

    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function canShowAgain() {
    if (typeof window === "undefined") {
        return false;
    }

    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY));
    if (!dismissedAt) {
        return true;
    }

    return Date.now() - dismissedAt > DISMISS_DURATION_MS;
}

export default function InstallPrompt() {
    const { lang } = useLocale();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(
        () => !isStandaloneMode() && canShowAgain() && isIosDevice()
    );
    const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());

    useEffect(() => {
        if (isStandaloneMode() || !canShowAgain()) {
            return undefined;
        }

        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
            setIsVisible(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsVisible(false);
            setDeferredPrompt(null);
            window.localStorage.removeItem(DISMISS_KEY);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const content = useMemo(() => {
        if (lang === "en") {
            return {
                badge: "Install the app",
                title: "Add Fontaine Info to your home screen",
                body: deferredPrompt
                    ? "Install the app for faster access, a full-screen experience and easier reopening during visits."
                    : "On iPhone or iPad, tap Share, then choose Add to Home Screen to install the app.",
                primary: "Install",
                secondary: "Later",
                iosHint: "Safari: Share → Add to Home Screen",
            };
        }

        return {
            badge: "Installer l'application",
            title: "Ajoutez Fontaine Info à votre écran d'accueil",
            body: deferredPrompt
                ? "Installez l'application pour un accès plus rapide, un affichage plein écran et une réouverture simple pendant la visite."
                : "Sur iPhone ou iPad, touchez Partager puis Sur l'écran d'accueil pour installer l'application.",
            primary: "Installer",
            secondary: "Plus tard",
            iosHint: "Safari : Partager → Sur l'écran d'accueil",
        };
    }, [deferredPrompt, lang]);

    async function handleInstall() {
        if (!deferredPrompt) {
            return;
        }

        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;

        if (choice?.outcome !== "accepted") {
            window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
            setIsVisible(false);
        }

        setDeferredPrompt(null);
    }

    function handleDismiss() {
        window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
        setIsVisible(false);
    }

    if (isInstalled || !isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 bottom-4 z-[1400] px-4 sm:bottom-6 sm:px-6">
            <div className="mx-auto max-w-xl rounded-[1.8rem] border border-[#d8c08f]/50 bg-[linear-gradient(135deg,rgba(22,60,53,0.96),rgba(31,94,84,0.94)_58%,rgba(216,192,143,0.96))] p-5 text-white shadow-[0_30px_80px_rgba(22,60,53,0.36)] backdrop-blur-md">
                <p className="section-kicker text-[#efe3be]">{content.badge}</p>
                <h2 className="mt-2 text-2xl leading-tight text-white sm:text-3xl">{content.title}</h2>
                <p className="mt-3 text-sm text-white/85 sm:text-base">{content.body}</p>
                {!deferredPrompt && isIosDevice() && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#efe3be]">
                        {content.iosHint}
                    </p>
                )}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    {deferredPrompt && (
                        <button
                            type="button"
                            onClick={handleInstall}
                            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#163c35] transition hover:bg-[#f6f3ea]"
                        >
                            {content.primary}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                        {content.secondary}
                    </button>
                </div>
            </div>
        </div>
    );
}
