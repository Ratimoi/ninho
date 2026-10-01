import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { toast } from "sonner"
import type { ReservaType, StatusReserva } from "../utils/types"
import { obterClienteToken } from "../utils/auth"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"

const apiUrl = import.meta.env.VITE_API_URL

const statusTom: Record<StatusReserva, "amber" | "brand" | "red"> = {
    PENDENTE: "amber",
    CONFIRMADA: "brand",
    CANCELADA: "red"
}

export default function MinhasReservas() {
    const token = obterClienteToken()
    const [reservas, setReservas] = useState<ReservaType[]>([])
    const [avaliando, setAvaliando] = useState<number | null>(null)
    const [nota, setNota] = useState(5)
    const [comentario, setComentario] = useState("")

    async function buscar() {
        if (!token) return
        const response = await fetch(`${apiUrl}/reserva/minhas`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        const dados = await response.json()
        setReservas(dados)
    }

    useEffect(() => {
        buscar()
    }, [])

    async function enviarAvaliacao(id: number) {
        if (!token) return

        const response = await fetch(`${apiUrl}/reserva/${id}/avaliar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ nota, avaliacao: comentario })
        })

        if (!response.ok) {
            toast.error("Não foi possível enviar a avaliação")
            return
        }

        toast.success("Avaliação enviada!")
        setAvaliando(null)
        setComentario("")
        setNota(5)
        buscar()
    }

    if (!token) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-display font-semibold text-brand-900 mb-6">Minhas reservas</h1>

            {reservas.length === 0 ? (
                <p className="text-gray-400 text-center py-12">Você ainda não fez nenhuma reserva.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {reservas.map(reserva => (
                        <Card key={reserva.id}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-display font-semibold text-lg text-gray-900">{reserva.imovel?.titulo}</p>
                                    <p className="text-sm text-gray-500">{reserva.imovel?.cidade}</p>
                                </div>
                                <Badge tone={statusTom[reserva.status]}>{reserva.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                                {new Date(reserva.dataInicio).toLocaleDateString("pt-br")} até {new Date(reserva.dataFim).toLocaleDateString("pt-br")}
                            </p>
                            <p className="text-sm text-gray-800 font-semibold">
                                R$ {reserva.valorTotal.toLocaleString("pt-br", { minimumFractionDigits: 2 })}
                            </p>

                            {reserva.respostaAdmin && (
                                <div className="mt-3 p-3 bg-brand-50 border border-brand-100 rounded-xl text-sm text-brand-800">
                                    <strong>Resposta:</strong> {reserva.respostaAdmin}
                                </div>
                            )}

                            {reserva.nota ? (
                                <p className="mt-3 text-sm text-accent-600">Sua avaliação: ★ {reserva.nota} — {reserva.avaliacao}</p>
                            ) : avaliando === reserva.id ? (
                                <div className="mt-3 flex flex-col gap-2">
                                    <select
                                        value={nota}
                                        onChange={e => setNota(Number(e.target.value))}
                                        className="p-2 border border-cream-200 bg-cream-50 rounded-xl w-24"
                                    >
                                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>★ {n}</option>)}
                                    </select>
                                    <textarea
                                        placeholder="Comentário"
                                        value={comentario}
                                        onChange={e => setComentario(e.target.value)}
                                        className="p-2 border border-cream-200 bg-cream-50 rounded-xl"
                                    />
                                    <Button onClick={() => enviarAvaliacao(reserva.id)} className="self-start text-sm px-3 py-2">
                                        Enviar avaliação
                                    </Button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAvaliando(reserva.id)}
                                    className="mt-3 text-sm text-accent-600 font-medium underline"
                                >
                                    Avaliar
                                </button>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
