import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom"
import { obterAdmin, sairAdmin } from "../../utils/auth"
import { Logo } from "../../components/ui/Logo"

const linkClasse = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-xl text-sm transition-colors ${isActive ? "bg-accent-400 text-ink-900 font-semibold" : "text-ink-200 hover:bg-ink-800"}`

export default function AdminLayout() {
    const admin = obterAdmin()
    const navigate = useNavigate()

    if (!admin) {
        return <Navigate to="/admin/login" replace />
    }

    async function sair() {
        await sairAdmin()
        navigate("/admin/login")
    }

    return (
        <div className="min-h-screen bg-paper-50">
            <div className="max-w-screen-xl mx-auto p-4 md:p-6 flex gap-6 min-h-screen">
                <aside className="w-56 shrink-0 bg-ink-900 p-4 rounded-xl flex flex-col gap-1 h-fit sticky top-6">
                    <div className="mb-4 px-1">
                        <Logo />
                    </div>
                    <p className="text-ink-200 text-xs px-3 mb-2 truncate">{admin?.nome}</p>
                    <NavLink to="/admin" end className={linkClasse}>Dashboard</NavLink>
                    <NavLink to="/admin/imoveis" className={linkClasse}>Imóveis</NavLink>
                    <NavLink to="/admin/reservas" className={linkClasse}>Interações</NavLink>
                    <button onClick={sair} className="mt-4 text-left px-3 py-2 rounded-xl text-sm text-ink-200 hover:bg-ink-800 transition-colors">
                        Sair
                    </button>
                </aside>
                <div className="flex-1 min-w-0">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
