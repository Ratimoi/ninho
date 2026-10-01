import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { Navbar } from "./components/Navbar"

export default function Layout() {
    return (
        <div className="min-h-screen bg-cream-50">
            <Navbar />
            <main className="max-w-screen-xl mx-auto p-4 md:p-6">
                <Outlet />
            </main>
            <Toaster richColors position="top-center" />
        </div>
    )
}
