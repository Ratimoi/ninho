import { Link, useNavigate } from "react-router-dom"
import { obterCliente, limparCliente } from "../utils/auth"

export function Navbar() {
    const navigate = useNavigate()
    const cliente = obterCliente()

    function sair() {
        limparCliente()
        navigate("/")
    }

    return (
        <nav className="border-b border-emerald-800 bg-emerald-700">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link to="/" className="text-2xl font-semibold text-white">
                    🪺 Ninho
                </Link>
                <ul className="flex items-center gap-4 text-white">
                    {cliente ? (
                        <>
                            <li className="text-sm">Olá, {cliente.nome}</li>
                            <li>
                                <Link to="/minhas-reservas" className="hover:underline">Minhas reservas</Link>
                            </li>
                            <li>
                                <Link to="/imovel/novo" className="hover:underline">Anunciar imóvel</Link>
                            </li>
                            <li>
                                <button onClick={sair} className="hover:underline cursor-pointer">Sair</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/login" className="hover:underline">Entrar</Link>
                            </li>
                            <li>
                                <Link to="/cadastro" className="hover:underline">Cadastrar</Link>
                            </li>
                        </>
                    )}
                    <li>
                        <Link to="/admin/login" className="text-emerald-200 text-sm hover:underline">Área admin</Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
