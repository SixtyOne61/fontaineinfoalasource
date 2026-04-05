import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-[#f6f8f5] flex flex-col">
            <Navbar />

            <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
                {children}
            </main>

            <footer className="bg-[#163c35] text-[#d7e8e1] text-center py-5 mt-auto">
                © {new Date().getFullYear()} Fontaine Info à la Source
            </footer>
        </div>
    );
}