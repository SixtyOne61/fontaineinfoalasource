export default function CoverImage({
                                       src,
                                       alt,
                                       className = "",
                                       fallbackText = "Illustration indisponible",
                                   }) {
    if (!src) {
        return (
            <div
                className={`flex items-center justify-center bg-[#d7e8e1] text-[#1f5e54] text-sm font-medium ${className}`}
            >
                {fallbackText}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
        />
    );
}
