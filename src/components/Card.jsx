export default function Card({ title, date, children }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {date && <p className="text-sm text-slate-500 mt-1">{date}</p>}
            <div className="mt-3">{children}</div>
        </article>
    );
}