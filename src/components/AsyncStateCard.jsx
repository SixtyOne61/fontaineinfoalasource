import { Link } from "react-router-dom";
import Layout from "./Layout";

export default function AsyncStateCard({ title, description, linkTo, linkLabel }) {
    return (
        <Layout>
            <div className="surface-card rounded-[1.85rem] border border-white/70 p-6 shadow-[0_18px_60px_rgba(22,60,53,0.08)] sm:p-8">
                <h1 className="mb-2 text-3xl text-slate-900">{title}</h1>
                <p className="mb-4 text-slate-600">{description}</p>
                {linkTo && linkLabel ? (
                    <Link to={linkTo} className="text-[#1f5e54] hover:underline">
                        {linkLabel}
                    </Link>
                ) : null}
            </div>
        </Layout>
    );
}
