import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
                {children}
            </main>
            <footer className="bg-slate-900 text-slate-200 text-center py-4 mt-auto">
                © {new Date().getFullYear()} Fontaine Info à la Source
            </footer>
        </div>
    );
}