import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { ReservaType, StatusReserva } from "../../utils/types"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { ButtonGroup } from "../../components/ui/ButtonGroup"
import { IconButton } from "../../components/ui/IconButton"

const iconeEnviar = (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.4 20.4l17.45-7.48a.5.5 0 000-.92L3.4 3.52a.5.5 0 00-.7.56l1.6 6.6a1 1 0 00.78.75l9.12 1.57-9.12 1.57a1 1 0 00-.78.75l-1.6 6.6a.5.5 0 00.7.56z" />
    </svg>
)

const apiUrl = import.meta.env.VITE_API_URL

const statusTom: Record<StatusReserva, "amber" | "accent" | "red"> = {
    PENDENTE: "amber",
    CONFIRMADA: "accent",
    CANCELADA: "red"
}

export default function ReservasAdmin() {
    const [reservas, setReservas] = useState<ReservaType[]>([])
    const [resposta, setResposta] = useState<Record<number, string>>({})
    const [enviando, setEnviando] = useState<number | null>(null)

    async function buscar() {
        const response = await fetch(`${apiUrl}/reserva`, {
            credentials: "include"
        })
        setReservas(await response.json())
    }

    useEffect(() => {
        buscar()
    }, [])

    async function responder(id: number) {
        const texto = resposta[id]?.trim()
        if (!texto) return

        setEnviando(id)
        const response = await fetch(`${apiUrl}/reserva/${id}/responder`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ respostaAdmin: texto })
        })
        setEnviando(null)

        if (!response.ok) {
            toast.error("Não foi possível enviar a resposta")
            return
        }

        const resultado = await response.json()
        if (resultado.email?.enviado) {
            toast.success("Resposta enviada e e-mail entregue ao cliente")
        } else {
            toast.success("Resposta salva", {
                description: `E-mail não enviado (${resultado.email?.motivo ?? "motivo desconhecido"})`
            })
        }
        buscar()
    }

    async function mudarStatus(id: number, status: StatusReserva) {
        const response = await fetch(`${apiUrl}/reserva/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status })
        })

        if (!response.ok) {
            toast.error("Não foi possível atualizar o status")
            return
        }

        buscar()
    }

    async function excluir(id: number) {
        if (!confirm("Excluir esta interação?")) return

        const response = await fetch(`${apiUrl}/reserva/${id}`, {
            method: "DELETE",
            credentials: "include"
        })

        if (!response.ok) {
            toast.error("Não foi possível excluir")
            return
        }

        toast.success("Interação excluída")
        buscar()
    }

    return (
        <div>
            <h1 className="text-2xl font-display font-bold text-ink-900 mb-4 tracking-tight">Interações dos clientes</h1>
            <div className="flex flex-col gap-4">
                {reservas.map(reserva => (
                    <Card key={reserva.id}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-display font-semibold text-ink-900">{reserva.imovel?.titulo}</p>
                                <p className="text-sm text-ink-400">
                                    Cliente: {reserva.cliente?.nome} ({reserva.cliente?.email})
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge tone={statusTom[reserva.status]}>{reserva.status}</Badge>
                                <IconButton tone="danger" aria-label="Excluir interação" onClick={() => excluir(reserva.id)}>
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" /></svg>
                                </IconButton>
                            </div>
                        </div>

                        {reserva.avaliacao && (
                            <p className="text-sm text-accent-600 mb-2">★ {reserva.nota} — {reserva.avaliacao}</p>
                        )}

                        <div className="mb-3">
                            <ButtonGroup>
                                {(["PENDENTE", "CONFIRMADA", "CANCELADA"] as StatusReserva[]).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => mudarStatus(reserva.id, status)}
                                        disabled={reserva.status === status}
                                        className="px-2.5 py-1.5 text-xs font-medium disabled:bg-ink-900 disabled:text-white hover:bg-paper-50 disabled:hover:bg-ink-900 transition-colors"
                                    >
                                        {status}
                                    </button>
                                ))}
                            </ButtonGroup>
                        </div>

                        {reserva.respostaAdmin ? (
                            <p className="text-sm text-ink-700">Resposta enviada: {reserva.respostaAdmin}</p>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    placeholder="Responder ao cliente..."
                                    value={resposta[reserva.id] ?? ""}
                                    onChange={e => setResposta({ ...resposta, [reserva.id]: e.target.value })}
                                    onKeyDown={e => e.key === "Enter" && responder(reserva.id)}
                                    disabled={enviando === reserva.id}
                                    className="flex-1 p-2.5 text-sm border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400 disabled:opacity-60"
                                />
                                <Button
                                    onClick={() => responder(reserva.id)}
                                    disabled={!resposta[reserva.id]?.trim()}
                                    loading={enviando === reserva.id}
                                    icon={iconeEnviar}
                                    aria-label="Enviar resposta"
                                    className="shrink-0 w-10 h-10 p-0 rounded-full"
                                />
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    )
}
