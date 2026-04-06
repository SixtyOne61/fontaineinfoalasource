import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-[#f6f8f5]">
            <Navbar />

            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
                {children}
            </main>

            <footer className="mt-auto bg-[#163c35] px-4 py-4 text-center text-sm text-[#d7e8e1] sm:py-5 sm:text-base">
                © {new Date().getFullYear()} Fontaine Info à la Source
            </footer>
        </div>
    );
}
