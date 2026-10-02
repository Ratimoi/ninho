import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
    novaSenha: string
}

export default function RedefinirSenha() {
    const { register, handleSubmit } = useForm<Inputs>()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get("token")

    async function redefinir(data: Inputs) {
        if (!token) return

        const response = await fetch(`${apiUrl}/usuario/redefinir-senha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, novaSenha: data.novaSenha })
        })

        if (!response.ok) {
            const resultado = await response.json()
            toast.error(resultado.erro ?? "Não foi possível redefinir a senha")
            return
        }

        toast.success("Senha redefinida com sucesso! Entre com sua nova senha.")
        navigate("/login")
    }

    return (
        <div className="max-w-sm mx-auto mt-12">
            <Card className="p-8">
                <h1 className="text-3xl font-display font-bold mb-6 text-ink-900 tracking-tight">Redefinir senha</h1>

                {!token ? (
                    <p className="text-ink-400">
                        Link inválido. <Link to="/esqueci-senha" className="text-accent-600 font-medium underline">Peça um novo link</Link>.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit(redefinir)} className="flex flex-col gap-3">
                        <input
                            type="password"
                            placeholder="Nova senha (mínimo 6 caracteres)"
                            className="p-3 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                            required
                            minLength={6}
                            {...register("novaSenha")}
                        />
                        <Button
                            type="submit"
                            className="mt-2"
                            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
                        >
                            Redefinir senha
                        </Button>
                    </form>
                )}
            </Card>
        </div>
    )
}
