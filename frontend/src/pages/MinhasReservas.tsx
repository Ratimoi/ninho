import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { toast } from "sonner"
import type { ReservaType } from "../utils/types"
import { obterClienteToken } from "../utils/auth"

const apiUrl = import.meta.env.VITE_API_URL

const statusCor: Record<string, string> = {
    PENDENTE: "bg-amber-100 text-amber-800",
    CONFIRMADA: "bg-emerald-100 text-emerald-800",
    CANCELADA: "bg-red-100 text-red-800"
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Minhas reservas</h1>

            {reservas.length === 0 ? (
                <p className="text-gray-500">Você ainda não fez nenhuma reserva.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {reservas.map(reserva => (
                        <div key={reserva.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-bold text-gray-900">{reserva.imovel?.titulo}</p>
                                    <p className="text-sm text-gray-600">{reserva.imovel?.cidade}</p>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded ${statusCor[reserva.status]}`}>
                                    {reserva.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                {new Date(reserva.dataInicio).toLocaleDateString("pt-br")} até {new Date(reserva.dataFim).toLocaleDateString("pt-br")}
                            </p>
                            <p className="text-sm text-gray-800 font-semibold">
                                R$ {reserva.valorTotal.toLocaleString("pt-br", { minimumFractionDigits: 2 })}
                            </p>

                            {reserva.respostaAdmin && (
                                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-800">
                                    <strong>Resposta:</strong> {reserva.respostaAdmin}
                                </div>
                            )}

                            {reserva.nota ? (
                                <p className="mt-2 text-sm text-amber-600">Sua avaliação: ★ {reserva.nota} — {reserva.avaliacao}</p>
                            ) : avaliando === reserva.id ? (
                                <div className="mt-3 flex flex-col gap-2">
                                    <select
                                        value={nota}
                                        onChange={e => setNota(Number(e.target.value))}
                                        className="p-2 border border-gray-300 rounded-lg w-24"
                                    >
                                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>★ {n}</option>)}
                                    </select>
                                    <textarea
                                        placeholder="Comentário"
                                        value={comentario}
                                        onChange={e => setComentario(e.target.value)}
                                        className="p-2 border border-gray-300 rounded-lg"
                                    />
                                    <button
                                        onClick={() => enviarAvaliacao(reserva.id)}
                                        className="self-start px-3 py-2 text-sm text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
                                    >
                                        Enviar avaliação
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAvaliando(reserva.id)}
                                    className="mt-2 text-sm text-emerald-700 underline"
                                >
                                    Avaliar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
