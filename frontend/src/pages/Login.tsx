import { useForm } from "react-hook-form"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { salvarCliente } from "../utils/auth"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
    email: string
    senha: string
}

export default function Login() {
    const { register, handleSubmit } = useForm<Inputs>()
    const navigate = useNavigate()

    async function entrar(data: Inputs) {
        const response = await fetch(`${apiUrl}/usuario/login`, {
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
        salvarCliente(dados.usuario)
        toast.success(`Bem-vindo(a), ${dados.usuario.nome}!`)
        navigate("/")
    }

    return (
        <div className="max-w-sm mx-auto mt-12">
            <Card className="p-8">
                <h1 className="text-3xl font-display font-semibold mb-6 text-brand-900">Entrar</h1>
                <form onSubmit={handleSubmit(entrar)} className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-3 border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
                        required
                        {...register("email")}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        className="p-3 border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
                        required
                        {...register("senha")}
                    />
                    <Button type="submit" className="mt-2">
                        Entrar
                    </Button>
                </form>
                <p className="mt-5 text-sm text-gray-500">
                    Não tem conta? <Link to="/cadastro" className="text-accent-600 font-medium underline">Cadastre-se</Link>
                </p>
            </Card>
        </div>
    )
}
