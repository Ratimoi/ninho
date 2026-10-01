import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { ReservaType, StatusReserva } from "../../utils/types"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"

const apiUrl = import.meta.env.VITE_API_URL

const statusTom: Record<StatusReserva, "amber" | "brand" | "red"> = {
    PENDENTE: "amber",
    CONFIRMADA: "brand",
    CANCELADA: "red"
}

export default function ReservasAdmin() {
    const [reservas, setReservas] = useState<ReservaType[]>([])
    const [resposta, setResposta] = useState<Record<number, string>>({})

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
        const texto = resposta[id]
        if (!texto) return

        const response = await fetch(`${apiUrl}/reserva/${id}/responder`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ respostaAdmin: texto })
        })

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
            <h1 className="text-2xl font-display font-semibold text-brand-900 mb-4">Interações dos clientes</h1>
            <div className="flex flex-col gap-4">
                {reservas.map(reserva => (
                    <Card key={reserva.id}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-display font-semibold text-gray-900">{reserva.imovel?.titulo}</p>
                                <p className="text-sm text-gray-500">
                                    Cliente: {reserva.cliente?.nome} ({reserva.cliente?.email})
                                </p>
                            </div>
                            <Badge tone={statusTom[reserva.status]}>{reserva.status}</Badge>
                        </div>

                        {reserva.avaliacao && (
                            <p className="text-sm text-accent-600 mb-2">★ {reserva.nota} — {reserva.avaliacao}</p>
                        )}

                        <div className="flex gap-2 mb-3">
                            {(["PENDENTE", "CONFIRMADA", "CANCELADA"] as StatusReserva[]).map(status => (
                                <button
                                    key={status}
                                    onClick={() => mudarStatus(reserva.id, status)}
                                    disabled={reserva.status === status}
                                    className="px-2.5 py-1 text-xs rounded-lg border border-cream-200 disabled:opacity-40 hover:bg-cream-100"
                                >
                                    {status}
                                </button>
                            ))}
                            <button onClick={() => excluir(reserva.id)} className="ml-auto text-red-600 text-xs hover:underline">
                                Excluir
                            </button>
                        </div>

                        {reserva.respostaAdmin ? (
                            <p className="text-sm text-brand-700">Resposta enviada: {reserva.respostaAdmin}</p>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    placeholder="Responder ao cliente..."
                                    value={resposta[reserva.id] ?? ""}
                                    onChange={e => setResposta({ ...resposta, [reserva.id]: e.target.value })}
                                    className="flex-1 p-2.5 text-sm border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
                                />
                                <Button onClick={() => responder(reserva.id)} className="text-sm px-3 py-2">
                                    Enviar
                                </Button>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    )
}
