import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { toast } from "sonner"
import type { ReservaType, StatusReserva } from "../utils/types"
import { obterCliente } from "../utils/auth"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"

const apiUrl = import.meta.env.VITE_API_URL

const statusTom: Record<StatusReserva, "amber" | "accent" | "red"> = {
    PENDENTE: "amber",
    CONFIRMADA: "accent",
    CANCELADA: "red"
}

export default function MinhasReservas() {
    const cliente = obterCliente()
    const [reservas, setReservas] = useState<ReservaType[]>([])
    const [avaliando, setAvaliando] = useState<number | null>(null)
    const [nota, setNota] = useState(5)
    const [comentario, setComentario] = useState("")
    const [enviando, setEnviando] = useState(false)

    async function buscar() {
        if (!cliente) return
        const response = await fetch(`${apiUrl}/reserva/minhas`, {
            credentials: "include"
        })
        const dados = await response.json()
        setReservas(dados)
    }

    useEffect(() => {
        buscar()
    }, [])

    async function enviarAvaliacao(id: number) {
        if (!cliente || !comentario.trim()) return

        setEnviando(true)
        const response = await fetch(`${apiUrl}/reserva/${id}/avaliar`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ nota, avaliacao: comentario })
        })
        setEnviando(false)

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

    if (!cliente) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-display font-bold text-ink-900 mb-6 tracking-tight">Minhas reservas</h1>

            {reservas.length === 0 ? (
                <p className="text-ink-200 text-center py-12">Você ainda não fez nenhuma reserva.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {reservas.map(reserva => (
                        <Card key={reserva.id}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-display font-semibold text-lg text-ink-900">{reserva.imovel?.titulo}</p>
                                    <p className="text-sm text-ink-400">{reserva.imovel?.cidade}</p>
                                </div>
                                <Badge tone={statusTom[reserva.status]}>{reserva.status}</Badge>
                            </div>
                            <p className="text-sm text-ink-400">
                                {new Date(reserva.dataInicio).toLocaleDateString("pt-br")} até {new Date(reserva.dataFim).toLocaleDateString("pt-br")}
                            </p>
                            <p className="text-sm text-ink-900 font-semibold">
                                R$ {reserva.valorTotal.toLocaleString("pt-br", { minimumFractionDigits: 2 })}
                            </p>

                            {reserva.respostaAdmin && (
                                <div className="mt-3 p-3 bg-accent-100 rounded-xl text-sm text-ink-900">
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
                                        className="p-2 border border-line-200 bg-paper-50 rounded-xl w-24"
                                    >
                                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>★ {n}</option>)}
                                    </select>
                                    <textarea
                                        placeholder="Comentário"
                                        value={comentario}
                                        onChange={e => setComentario(e.target.value)}
                                        className="p-2 border border-line-200 bg-paper-50 rounded-xl"
                                    />
                                    <Button
                                        onClick={() => enviarAvaliacao(reserva.id)}
                                        disabled={!comentario.trim()}
                                        loading={enviando}
                                        className="self-start text-sm px-4 py-2"
                                        icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4l17.45-7.48a.5.5 0 000-.92L3.4 3.52a.5.5 0 00-.7.56l1.6 6.6a1 1 0 00.78.75l9.12 1.57-9.12 1.57a1 1 0 00-.78.75l-1.6 6.6a.5.5 0 00.7.56z" /></svg>}
                                    >
                                        {enviando ? "Enviando..." : "Enviar avaliação"}
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
