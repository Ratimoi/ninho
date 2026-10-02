import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { salvarAdmin } from "../../utils/auth"
import { Button } from "../../components/ui/Button"
import { Logo } from "../../components/ui/Logo"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
    email: string
    senha: string
}

export default function AdminLogin() {
    const { register, handleSubmit } = useForm<Inputs>()
    const navigate = useNavigate()

    async function entrar(data: Inputs) {
        const response = await fetch(`${apiUrl}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            toast.error("Email ou senha inválidos")
            return
        }

        const dados = await response.json()
        salvarAdmin(dados.admin)
        navigate("/admin")
    }

    return (
        <div className="max-w-sm mx-auto mt-12">
            <div className="bg-ink-900 rounded-xl p-8 shadow-lg">
                <div className="mb-6">
                    <Logo />
                </div>
                <h1 className="text-xl font-display font-semibold mb-5 text-ink-200">Acesso restrito</h1>
                <form onSubmit={handleSubmit(entrar)} className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-3 border border-ink-700 bg-ink-800 text-white placeholder:text-ink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                        required
                        {...register("email")}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        className="p-3 border border-ink-700 bg-ink-800 text-white placeholder:text-ink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                        required
                        {...register("senha")}
                    />
                    <Button
                        type="submit"
                        className="mt-2"
                        icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
                    >
                        Entrar como admin
                    </Button>
                </form>
            </div>
        </div>
    )
}
