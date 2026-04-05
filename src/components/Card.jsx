export default function Card({ title, date, children }) {
    return (
        <article className="rounded-2xl border border-[#d7e8e1] bg-white p-5 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-bold text-[#163c35]">{title}</h2>
            {date && <p className="text-sm text-[#5b7d76] mt-1">{date}</p>}
            <div className="mt-3 text-[#2b4e47]">{children}</div>
        </article>
    );
}