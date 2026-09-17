import { useForm } from "react-hook-form"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { salvarCliente } from "../utils/auth"

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
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            toast.error("Email ou senha inválidos")
            return
        }

        const dados = await response.json()
        salvarCliente(dados.token, dados.usuario)
        toast.success(`Bem-vindo(a), ${dados.usuario.nome}!`)
        navigate("/")
    }

    return (
        <div className="max-w-sm mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Entrar</h1>
            <form onSubmit={handleSubmit(entrar)} className="flex flex-col gap-3">
                <input
                    type="email"
                    placeholder="Email"
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                    {...register("email")}
                />
                <input
                    type="password"
                    placeholder="Senha"
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                    {...register("senha")}
                />
                <button type="submit" className="p-3 text-white bg-emerald-700 rounded-lg hover:bg-emerald-800">
                    Entrar
                </button>
            </form>
            <p className="mt-4 text-sm text-gray-600">
                Não tem conta? <Link to="/cadastro" className="text-emerald-700 underline">Cadastre-se</Link>
            </p>
        </div>
    )
}
