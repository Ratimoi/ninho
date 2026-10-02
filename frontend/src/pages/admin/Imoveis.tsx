import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { ImovelType } from "../../utils/types"
import { Badge } from "../../components/ui/Badge"
import { IconButton } from "../../components/ui/IconButton"

const apiUrl = import.meta.env.VITE_API_URL

export default function ImoveisAdmin() {
    const [imoveis, setImoveis] = useState<ImovelType[]>([])

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
            headers: { "Content-Type": "application/json" },
            credentials: "include",
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
            credentials: "include"
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
            <h1 className="text-2xl font-display font-bold text-ink-900 mb-4 tracking-tight">Imóveis cadastrados</h1>
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg shadow-ink-900/5">
                <table className="w-full text-sm text-left">
                    <thead className="bg-paper-50 text-ink-400">
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
                            <tr key={imovel.id} className="border-t border-line-200">
                                <td className="p-3">{imovel.titulo}</td>
                                <td className="p-3">{imovel.cidade}</td>
                                <td className="p-3">R$ {Number(imovel.preco).toLocaleString("pt-br")}</td>
                                <td className="p-3">
                                    <button onClick={() => alternarDestaque(imovel)}>
                                        <Badge tone={imovel.destaque ? "accent" : "gray"}>
                                            {imovel.destaque ? "Em destaque" : "Marcar destaque"}
                                        </Badge>
                                    </button>
                                </td>
                                <td className="p-3">
                                    <IconButton tone="danger" aria-label="Excluir imóvel" onClick={() => excluir(imovel.id)}>
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" /></svg>
                                    </IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
