import CoverImage from "./CoverImage";

export default function Card({ title, date, image, children }) {
    return (
        <article className="overflow-hidden rounded-2xl border border-[#d7e8e1] bg-white shadow-sm hover:shadow-md transition">
            <CoverImage
                src={image}
                alt={title}
                className="h-40 sm:h-48 w-full object-cover"
            />

            <div className="p-4 sm:p-5">
                <h2 className="text-lg sm:text-xl font-bold text-[#163c35]">{title}</h2>
                {date && <p className="text-sm text-[#5b7d76] mt-1">{date}</p>}
                <div className="mt-3 text-[#2b4e47]">{children}</div>
            </div>
        </article>
    );
}