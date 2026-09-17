import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { Navbar } from "./components/Navbar"

export default function Layout() {
    return (
        <>
            <Navbar />
            <main className="max-w-screen-xl mx-auto p-4">
                <Outlet />
            </main>
            <Toaster richColors position="top-center" />
        </>
    )
}
