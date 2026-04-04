import Navbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 p-6 max-w-5xl mx-auto">{children}</main>
            <footer className="bg-blue-600 text-white text-center py-4 mt-auto">
                &copy; {new Date().getFullYear()} Ville - Tous droits réservés
            </footer>
        </div>
    );
}