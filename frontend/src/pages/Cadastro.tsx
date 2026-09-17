import { useForm } from "react-hook-form"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { salvarCliente } from "../utils/auth"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
    nome: string
    email: string
    senha: string
}

export default function Cadastro() {
    const { register, handleSubmit } = useForm<Inputs>()
    const navigate = useNavigate()

    async function cadastrar(data: Inputs) {
        const responseCadastro = await fetch(`${apiUrl}/usuario/cadastro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })

        if (!responseCadastro.ok) {
            const erro = await responseCadastro.json()
            toast.error(erro.erro ?? "Não foi possível cadastrar")
            return
        }

        const responseLogin = await fetch(`${apiUrl}/usuario/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.email, senha: data.senha })
        })
        const dadosLogin = await responseLogin.json()
        salvarCliente(dadosLogin.token, dadosLogin.usuario)

        toast.success("Cadastro realizado com sucesso!")
        navigate("/")
    }

    return (
        <div className="max-w-sm mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Criar conta</h1>
            <form onSubmit={handleSubmit(cadastrar)} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Nome"
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                    minLength={3}
                    {...register("nome")}
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                    {...register("email")}
                />
                <input
                    type="password"
                    placeholder="Senha (mínimo 6 caracteres)"
                    className="p-3 border border-gray-300 rounded-lg"
                    required
                    minLength={6}
                    {...register("senha")}
                />
                <button type="submit" className="p-3 text-white bg-emerald-700 rounded-lg hover:bg-emerald-800">
                    Cadastrar
                </button>
            </form>
            <p className="mt-4 text-sm text-gray-600">
                Já tem conta? <Link to="/login" className="text-emerald-700 underline">Entrar</Link>
            </p>
        </div>
    )
}
