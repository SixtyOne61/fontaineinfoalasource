import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col overflow-x-clip bg-transparent">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#163c35] focus:shadow-[0_12px_30px_rgba(22,60,53,0.2)]"
            >
                Aller au contenu principal
            </a>

            <div className="pointer-events-none fixed inset-0 -z-10 opacity-80" aria-hidden="true">
                <div className="absolute left-[-8rem] top-20 h-64 w-64 rounded-full bg-[#d8c08f]/20 blur-3xl" />
                <div className="absolute right-[-5rem] top-52 h-72 w-72 rounded-full bg-[#3f977b]/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#1f5e54]/8 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(255,255,255,0.32),transparent)]" />
            </div>

            <Navbar />

            <main
                id="main-content"
                className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-8"
            >
                {children}
            </main>

            <footer className="relative z-10 mt-auto border-t border-white/40 bg-[#163c35] px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-sm text-[#d7e8e1] sm:px-6 sm:text-base">
                © {new Date().getFullYear()} Fontaine Info à la Source
            </footer>
        </div>
    );
}
