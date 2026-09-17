import { Link } from "react-router-dom"
import type { ImovelType } from "../utils/types"

export function ImovelCard({ data }: { data: ImovelType }) {
    const capa = data.imagens.find(img => img.capa) ?? data.imagens[0]

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="h-40 bg-gray-100 flex items-center justify-center">
                {capa ? (
                    <img src={capa.url} alt={data.titulo} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-gray-400 text-sm">Sem foto</span>
                )}
            </div>
            <div className="p-4">
                {data.destaque && (
                    <span className="inline-block mb-2 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-1 rounded">
                        Destaque
                    </span>
                )}
                <h5 className="mb-1 text-lg font-bold text-gray-900">{data.titulo}</h5>
                <p className="text-sm text-gray-600 mb-1">{data.cidade} — {data.quartos} quarto(s)</p>
                <p className="mb-2 font-extrabold text-gray-800">
                    R$ {Number(data.preco).toLocaleString("pt-br", { minimumFractionDigits: 2 })}/mês
                </p>
                {data.avaliacaoMedia != null && (
                    <p className="text-sm text-amber-600 mb-2">★ {data.avaliacaoMedia.toFixed(1)}</p>
                )}
                <Link
                    to={`/imovel/${data.id}`}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
                >
                    Ver detalhes
                </Link>
            </div>
        </div>
    )
}
