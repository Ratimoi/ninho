import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
    nome: string
    email: string
    senha: string
}

export default function Cadastro() {
    const { register, handleSubmit } = useForm<Inputs>()
    const [enviado, setEnviado] = useState(false)

    async function cadastrar(data: Inputs) {
        const response = await fetch(`${apiUrl}/usuario/cadastro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const erro = await response.json()
            toast.error(erro.erro ?? "Não foi possível cadastrar")
            return
        }

        setEnviado(true)
    }

    return (
        <div className="max-w-sm mx-auto mt-12">
            <Card className="p-8">
                <h1 className="text-3xl font-display font-semibold mb-6 text-brand-900">Criar conta</h1>

                {enviado ? (
                    <p className="text-gray-600">
                        Enviamos um link de confirmação para o seu e-mail. Clique nele pra ativar sua conta.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit(cadastrar)} className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Nome"
                            className="p-3 border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
                            required
                            minLength={3}
                            {...register("nome")}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="p-3 border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
                            required
                            {...register("email")}
                        />
                        <input
                            type="password"
                            placeholder="Senha (mínimo 6 caracteres)"
                            className="p-3 border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
                            required
                            minLength={6}
                            {...register("senha")}
                        />
                        <Button type="submit" className="mt-2">
                            Cadastrar
                        </Button>
                    </form>
                )}

                <p className="mt-5 text-sm text-gray-500">
                    Já tem conta? <Link to="/login" className="text-accent-600 font-medium underline">Entrar</Link>
                </p>
            </Card>
        </div>
    )
}
