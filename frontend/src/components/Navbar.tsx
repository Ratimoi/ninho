import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { obterCliente, sairCliente } from "../utils/auth"
import { Logo } from "./ui/Logo"

function iniciais(nome: string) {
    const partes = nome.trim().split(/\s+/)
    const primeira = partes[0]?.[0] ?? ""
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ""
    return (primeira + ultima).toUpperCase()
}

function MenuConta({ nome, onSair }: { nome: string, onSair: () => void }) {
    const [aberto, setAberto] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function aoClicarFora(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
        }
        document.addEventListener("mousedown", aoClicarFora)
        return () => document.removeEventListener("mousedown", aoClicarFora)
    }, [])

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setAberto(!aberto)}
                className="w-8 h-8 rounded-full bg-accent-400 text-ink-900 text-xs font-bold flex items-center justify-center hover:bg-accent-500 transition-colors cursor-pointer"
                aria-label="Menu da conta"
            >
                {iniciais(nome)}
            </button>
            {aberto && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg py-1.5 text-sm z-10">
                    <p className="px-3.5 py-1.5 text-ink-400 text-xs truncate">{nome}</p>
                    <Link
                        to="/perfil"
                        onClick={() => setAberto(false)}
                        className="block px-3.5 py-2 text-ink-900 hover:bg-paper-50 transition-colors"
                    >
                        Perfil
                    </Link>
                    <Link
                        to="/minhas-reservas"
                        onClick={() => setAberto(false)}
                        className="block px-3.5 py-2 text-ink-900 hover:bg-paper-50 transition-colors"
                    >
                        Minhas reservas
                    </Link>
                    <button
                        onClick={onSair}
                        className="w-full text-left px-3.5 py-2 text-red-600 hover:bg-paper-50 transition-colors cursor-pointer"
                    >
                        Sair
                    </button>
                </div>
            )}
        </div>
    )
}

export function Navbar() {
    const navigate = useNavigate()
    const cliente = obterCliente()

    async function sair() {
        await sairCliente()
        navigate("/")
    }

    return (
        <nav className="bg-ink-900 shadow-lg">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4 py-3">
                <div className="flex items-center gap-6">
                    <Link to="/">
                        <Logo />
                    </Link>
                    {cliente && (
                        <Link to="/minhas-reservas" className="hidden sm:inline text-sm text-ink-200 hover:text-white transition-colors">
                            Minhas reservas
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-5 text-ink-200 text-sm">
                    {cliente ? (
                        <>
                            <Link
                                to="/imovel/novo"
                                className="inline-flex items-center gap-1.5 bg-accent-400 hover:bg-accent-500 text-ink-900 px-3 py-1.5 rounded-xl font-semibold transition-colors"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                                Anunciar imóvel
                            </Link>
                            <div className="pl-5 border-l border-white/10">
                                <MenuConta nome={cliente.nome} onSair={sair} />
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-white transition-colors">Entrar</Link>
                            <Link
                                to="/cadastro"
                                className="bg-accent-400 hover:bg-accent-500 text-ink-900 px-3 py-1.5 rounded-xl font-semibold transition-colors"
                            >
                                Cadastrar
                            </Link>
                        </>
                    )}
                    <Link to="/admin/login" className="text-ink-400 hover:text-ink-200 transition-colors">Área admin</Link>
                </div>
            </div>
        </nav>
    )
}
