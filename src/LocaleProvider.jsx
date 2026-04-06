import { useEffect, useMemo, useState } from "react";
import { getBrowserDefault, LocaleContext, translations } from "./locale";

export default function LocaleProvider({ children }) {
    const [lang, setLang] = useState(getBrowserDefault);

    useEffect(() => {
        window.localStorage.setItem("fontaine-lang", lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const value = useMemo(
        () => ({
            lang,
            setLang,
            locale: lang === "en" ? "en-GB" : "fr-FR",
            t(key) {
                const parts = key.split(".");
                let current = translations[lang];

                for (const part of parts) {
                    current = current?.[part];
                }

                return current || key;
            }
        }),
        [lang]
    );

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
