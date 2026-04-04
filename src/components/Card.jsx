export default function Card({ title, date, children }) {
    return (
        <div className="border rounded-xl p-4 shadow hover:shadow-lg transition">
            <h2 className="text-xl font-bold">{title}</h2>
            {date && <p className="text-gray-500">{date}</p>}
            <div className="mt-2">{children}</div>
        </div>
    );
}