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
                <h1 className="text-3xl font-display font-semibold mb-6 text-brand-900">Redefinir senha</h1>

                {!token ? (
                    <p className="text-gray-600">
                        Link inválido. <Link to="/esqueci-senha" className="text-accent-600 font-medium underline">Peça um novo link</Link>.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit(redefinir)} className="flex flex-col gap-3">
                        <input
                            type="password"
                            placeholder="Nova senha (mínimo 6 caracteres)"
                            className="p-3 border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
                            required
                            minLength={6}
                            {...register("novaSenha")}
                        />
                        <Button type="submit" className="mt-2">
                            Redefinir senha
                        </Button>
                    </form>
                )}
            </Card>
        </div>
    )
}
