import { Link, useNavigate } from "react-router-dom"
import { obterCliente, sairCliente } from "../utils/auth"
import { Logo } from "./ui/Logo"

export function Navbar() {
    const navigate = useNavigate()
    const cliente = obterCliente()

    async function sair() {
        await sairCliente()
        navigate("/")
    }

    return (
        <nav className="bg-brand-700 shadow-sm">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 py-3">
                <Link to="/">
                    <Logo />
                </Link>
                <ul className="flex items-center gap-5 text-brand-50 text-sm">
                    {cliente ? (
                        <>
                            <li className="hidden sm:inline text-brand-200">Olá, {cliente.nome}</li>
                            <li>
                                <Link to="/minhas-reservas" className="hover:text-white transition-colors">Minhas reservas</Link>
                            </li>
                            <li>
                                <Link
                                    to="/imovel/novo"
                                    className="bg-accent-500 hover:bg-accent-600 text-white px-3 py-1.5 rounded-full font-medium transition-colors"
                                >
                                    Anunciar imóvel
                                </Link>
                            </li>
                            <li>
                                <button onClick={sair} className="hover:text-white transition-colors cursor-pointer">Sair</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/login" className="hover:text-white transition-colors">Entrar</Link>
                            </li>
                            <li>
                                <Link
                                    to="/cadastro"
                                    className="bg-accent-500 hover:bg-accent-600 text-white px-3 py-1.5 rounded-full font-medium transition-colors"
                                >
                                    Cadastrar
                                </Link>
                            </li>
                        </>
                    )}
                    <li>
                        <Link to="/admin/login" className="text-brand-300 hover:text-brand-100 transition-colors">Área admin</Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
