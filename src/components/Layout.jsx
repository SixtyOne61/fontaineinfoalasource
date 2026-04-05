import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-[#f6f8f5] flex flex-col">
            <Navbar />

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {children}
            </main>

            <footer className="bg-[#163c35] text-[#d7e8e1] text-center py-4 sm:py-5 mt-auto text-sm sm:text-base px-4">
                © {new Date().getFullYear()} Fontaine Info à la Source
            </footer>
        </div>
    );
}