import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom"
import { obterAdmin, obterAdminToken, limparAdmin } from "../../utils/auth"

const linkClasse = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-lg text-sm ${isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800"}`

export default function AdminLayout() {
    const token = obterAdminToken()
    const admin = obterAdmin()
    const navigate = useNavigate()

    if (!token) {
        return <Navigate to="/admin/login" replace />
    }

    function sair() {
        limparAdmin()
        navigate("/admin/login")
    }

    return (
        <div className="flex min-h-[80vh]">
            <aside className="w-56 bg-gray-900 p-4 flex flex-col gap-1 rounded-lg mr-4">
                <p className="text-white font-semibold mb-3">{admin?.nome}</p>
                <NavLink to="/admin" end className={linkClasse}>Dashboard</NavLink>
                <NavLink to="/admin/imoveis" className={linkClasse}>Imóveis</NavLink>
                <NavLink to="/admin/reservas" className={linkClasse}>Interações</NavLink>
                <button onClick={sair} className="mt-auto text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800">
                    Sair
                </button>
            </aside>
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    )
}
