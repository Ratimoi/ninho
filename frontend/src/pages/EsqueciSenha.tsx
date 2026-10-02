import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
    email: string
}

export default function EsqueciSenha() {
    const { register, handleSubmit } = useForm<Inputs>()
    const [enviado, setEnviado] = useState(false)

    async function enviar(data: Inputs) {
        const response = await fetch(`${apiUrl}/usuario/esqueci-senha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            toast.error("Não foi possível enviar o link de recuperação")
            return
        }

        setEnviado(true)
    }

    return (
        <div className="max-w-sm mx-auto mt-12">
            <Card className="p-8">
                <h1 className="text-3xl font-display font-bold mb-6 text-ink-900 tracking-tight">Esqueci minha senha</h1>

                {enviado ? (
                    <p className="text-ink-400">
                        Se existir uma conta com esse e-mail, enviamos um link de recuperação. Confira sua caixa de entrada.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit(enviar)} className="flex flex-col gap-3">
                        <p className="text-sm text-ink-400 -mt-2 mb-1">
                            Informe o e-mail da sua conta e enviaremos um link para redefinir a senha.
                        </p>
                        <input
                            type="email"
                            placeholder="Email"
                            className="p-3 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                            required
                            {...register("email")}
                        />
                        <Button
                            type="submit"
                            className="mt-2"
                            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M3 6h18v12H3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        >
                            Enviar link de recuperação
                        </Button>
                    </form>
                )}

                <p className="mt-5 text-sm text-ink-400">
                    <Link to="/login" className="text-accent-600 font-medium underline">Voltar para o login</Link>
                </p>
            </Card>
        </div>
    )
}
