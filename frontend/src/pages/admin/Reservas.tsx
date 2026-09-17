import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { ReservaType, StatusReserva } from "../../utils/types"
import { obterAdminToken } from "../../utils/auth"

const apiUrl = import.meta.env.VITE_API_URL

const statusCor: Record<StatusReserva, string> = {
    PENDENTE: "bg-amber-100 text-amber-800",
    CONFIRMADA: "bg-emerald-100 text-emerald-800",
    CANCELADA: "bg-red-100 text-red-800"
}

export default function ReservasAdmin() {
    const [reservas, setReservas] = useState<ReservaType[]>([])
    const [resposta, setResposta] = useState<Record<number, string>>({})
    const token = obterAdminToken()

    async function buscar() {
        const response = await fetch(`${apiUrl}/reserva`, {
            headers: { Authorization: `Bearer ${token}` }
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
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ respostaAdmin: texto })
        })

        if (!response.ok) {
            toast.error("Não foi possível enviar a resposta")
            return
        }

        toast.success("Resposta enviada")
        buscar()
    }

    async function mudarStatus(id: number, status: StatusReserva) {
        const response = await fetch(`${apiUrl}/reserva/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
            headers: { Authorization: `Bearer ${token}` }
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Interações dos clientes</h1>
            <div className="flex flex-col gap-4">
                {reservas.map(reserva => (
                    <div key={reserva.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-gray-900">{reserva.imovel?.titulo}</p>
                                <p className="text-sm text-gray-600">
                                    Cliente: {reserva.cliente?.nome} ({reserva.cliente?.email})
                                </p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${statusCor[reserva.status]}`}>
                                {reserva.status}
                            </span>
                        </div>

                        {reserva.avaliacao && (
                            <p className="text-sm text-amber-700 mb-2">★ {reserva.nota} — {reserva.avaliacao}</p>
                        )}

                        <div className="flex gap-2 mb-3">
                            {(["PENDENTE", "CONFIRMADA", "CANCELADA"] as StatusReserva[]).map(status => (
                                <button
                                    key={status}
                                    onClick={() => mudarStatus(reserva.id, status)}
                                    disabled={reserva.status === status}
                                    className="px-2 py-1 text-xs rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                                >
                                    {status}
                                </button>
                            ))}
                            <button onClick={() => excluir(reserva.id)} className="ml-auto text-red-600 text-xs hover:underline">
                                Excluir
                            </button>
                        </div>

                        {reserva.respostaAdmin ? (
                            <p className="text-sm text-emerald-700">Resposta enviada: {reserva.respostaAdmin}</p>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    placeholder="Responder ao cliente..."
                                    value={resposta[reserva.id] ?? ""}
                                    onChange={e => setResposta({ ...resposta, [reserva.id]: e.target.value })}
                                    className="flex-1 p-2 text-sm border border-gray-300 rounded-lg"
                                />
                                <button
                                    onClick={() => responder(reserva.id)}
                                    className="px-3 py-2 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800"
                                >
                                    Enviar
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
