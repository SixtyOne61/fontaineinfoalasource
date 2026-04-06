import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent">
            <div className="pointer-events-none absolute inset-0 opacity-70">
                <div className="absolute left-[-8rem] top-20 h-64 w-64 rounded-full bg-[#d8c08f]/20 blur-3xl" />
                <div className="absolute right-[-5rem] top-52 h-72 w-72 rounded-full bg-[#3f977b]/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#1f5e54]/8 blur-3xl" />
            </div>

            <Navbar />

            <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
                {children}
            </main>

            <footer className="relative z-10 mt-auto border-t border-white/40 bg-[#163c35] px-4 py-5 text-center text-sm text-[#d7e8e1] sm:text-base">
                © {new Date().getFullYear()} Fontaine Info à la Source
            </footer>
        </div>
    );
}
