import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { salvarCliente } from "../utils/auth"
import { Card } from "../components/ui/Card"

const apiUrl = import.meta.env.VITE_API_URL

type Estado = "confirmando" | "sucesso" | "erro"

export default function ConfirmarEmail() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get("token")
    const [estado, setEstado] = useState<Estado>(token ? "confirmando" : "erro")
    const jaEnviou = useRef(false)

    useEffect(() => {
        if (!token || jaEnviou.current) return
        jaEnviou.current = true

        async function confirmar() {
            const response = await fetch(`${apiUrl}/usuario/confirmar-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ token })
            })

            if (!response.ok) {
                setEstado("erro")
                return
            }

            const dados = await response.json()
            salvarCliente(dados.usuario)
            setEstado("sucesso")
            setTimeout(() => navigate("/"), 2000)
        }

        confirmar()
    }, [token, navigate])

    return (
        <div className="max-w-sm mx-auto mt-12">
            <Card className="p-8">
                <h1 className="text-3xl font-display font-bold mb-6 text-ink-900 tracking-tight">Confirmar cadastro</h1>

                {estado === "confirmando" && <p className="text-ink-400">Confirmando seu e-mail...</p>}

                {estado === "sucesso" && (
                    <p className="text-ink-400">Conta confirmada! Te levando pra home...</p>
                )}

                {estado === "erro" && (
                    <p className="text-ink-400">
                        Link inválido ou expirado. <Link to="/cadastro" className="text-accent-600 font-medium underline">Cadastre-se de novo</Link>.
                    </p>
                )}
            </Card>
        </div>
    )
}
