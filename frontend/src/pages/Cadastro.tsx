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
                <h1 className="text-3xl font-display font-bold mb-6 text-ink-900 tracking-tight">Criar conta</h1>

                {enviado ? (
                    <p className="text-ink-400">
                        Enviamos um link de confirmação para o seu e-mail. Clique nele pra ativar sua conta.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit(cadastrar)} className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Nome"
                            className="p-3 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                            required
                            minLength={3}
                            {...register("nome")}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="p-3 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                            required
                            {...register("email")}
                        />
                        <input
                            type="password"
                            placeholder="Senha (mínimo 6 caracteres)"
                            className="p-3 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                            required
                            minLength={6}
                            {...register("senha")}
                        />
                        <Button
                            type="submit"
                            className="mt-2"
                            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" /></svg>}
                        >
                            Cadastrar
                        </Button>
                    </form>
                )}

                <p className="mt-5 text-sm text-ink-400">
                    Já tem conta? <Link to="/login" className="text-accent-600 font-medium underline">Entrar</Link>
                </p>
            </Card>
        </div>
    )
}
