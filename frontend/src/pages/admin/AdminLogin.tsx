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
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            toast.error("Email ou senha inválidos")
            return
        }

        const dados = await response.json()
        salvarAdmin(dados.token, dados.admin)
        navigate("/admin")
    }

    return (
        <div className="max-w-sm mx-auto mt-12">
            <div className="bg-brand-900 rounded-2xl p-8 shadow-sm">
                <div className="mb-6">
                    <Logo />
                </div>
                <h1 className="text-xl font-display font-semibold mb-5 text-brand-100">Acesso restrito</h1>
                <form onSubmit={handleSubmit(entrar)} className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-3 border border-brand-700 bg-brand-800 text-white placeholder:text-brand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                        required
                        {...register("email")}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        className="p-3 border border-brand-700 bg-brand-800 text-white placeholder:text-brand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                        required
                        {...register("senha")}
                    />
                    <Button type="submit" variant="accent" className="mt-2">
                        Entrar como admin
                    </Button>
                </form>
            </div>
        </div>
    )
}
