import CoverImage from "./CoverImage";

export default function Card({ title, date, image, children }) {
    return (
        <article className="surface-card overflow-hidden rounded-[1.75rem] border border-white/70 shadow-[0_18px_60px_rgba(22,60,53,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(22,60,53,0.14)]">
            <CoverImage
                src={image}
                alt={title}
                className="h-44 w-full object-cover sm:h-52"
            />

            <div className="p-5 sm:p-6">
                {date && <p className="section-kicker mb-3">{date}</p>}
                <h2 className="text-xl text-[#163c35] sm:text-2xl">{title}</h2>
                <div className="mt-4 text-[#2b4e47]">{children}</div>
            </div>
        </article>
    );
}
