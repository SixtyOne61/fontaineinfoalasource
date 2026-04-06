import { useLocale } from "../useLocale";

export default function SearchBar({
    value,
    onChange,
    placeholder = "Rechercher...",
}) {
    const { t } = useLocale();

    return (
        <div className="mb-6">
            <label className="sr-only" htmlFor="search">
                {t("common.search")}
            </label>
            <input
                id="search"
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-[#a7cfc1] bg-white px-4 py-3.5 text-base text-[#163c35] outline-none focus:border-[#1f5e54] focus:ring-2 focus:ring-[#d7e8e1]"
            />
        </div>
    );
}
