export default function SearchBar({
                                      value,
                                      onChange,
                                      placeholder = "Rechercher...",
                                  }) {
    return (
        <div className="mb-6">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-[#a7cfc1] bg-white px-4 py-3 text-[#163c35] outline-none focus:border-[#1f5e54] focus:ring-2 focus:ring-[#d7e8e1]"
            />
        </div>
    );
}