import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { ImovelType } from "../../utils/types"
import { obterAdminToken } from "../../utils/auth"

const apiUrl = import.meta.env.VITE_API_URL

export default function ImoveisAdmin() {
    const [imoveis, setImoveis] = useState<ImovelType[]>([])
    const token = obterAdminToken()

    async function buscar() {
        const response = await fetch(`${apiUrl}/imovel`)
        setImoveis(await response.json())
    }

    useEffect(() => {
        buscar()
    }, [])

    async function alternarDestaque(imovel: ImovelType) {
        const response = await fetch(`${apiUrl}/imovel/${imovel.id}/destaque`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ destaque: !imovel.destaque })
        })

        if (!response.ok) {
            toast.error("Não foi possível atualizar o destaque")
            return
        }

        buscar()
    }

    async function excluir(id: number) {
        if (!confirm("Excluir este imóvel?")) return

        const response = await fetch(`${apiUrl}/imovel/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) {
            toast.error("Não foi possível excluir")
            return
        }

        toast.success("Imóvel excluído")
        buscar()
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Imóveis cadastrados</h1>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-3">Título</th>
                            <th className="p-3">Cidade</th>
                            <th className="p-3">Preço</th>
                            <th className="p-3">Destaque</th>
                            <th className="p-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {imoveis.map(imovel => (
                            <tr key={imovel.id} className="border-t border-gray-200">
                                <td className="p-3">{imovel.titulo}</td>
                                <td className="p-3">{imovel.cidade}</td>
                                <td className="p-3">R$ {Number(imovel.preco).toLocaleString("pt-br")}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => alternarDestaque(imovel)}
                                        className={`px-2 py-1 rounded text-xs font-semibold ${imovel.destaque ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}
                                    >
                                        {imovel.destaque ? "Em destaque" : "Marcar destaque"}
                                    </button>
                                </td>
                                <td className="p-3">
                                    <button onClick={() => excluir(imovel.id)} className="text-red-600 hover:underline">
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
