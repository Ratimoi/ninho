import { Link } from "react-router-dom"
import type { ImovelType } from "../utils/types"
import { resolverUrlImagem } from "../utils/imagem"
import { Badge } from "./ui/Badge"

export function ImovelCard({ data }: { data: ImovelType }) {
    const capa = data.imagens.find(img => img.capa) ?? data.imagens[0]

    return (
        <Link
            to={`/imovel/${data.id}`}
            className="group block bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
            <div className="h-44 bg-cream-100 flex items-center justify-center overflow-hidden">
                {capa ? (
                    <img
                        src={resolverUrlImagem(capa.url)}
                        alt={data.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <span className="text-brand-300 text-sm">Sem foto</span>
                )}
            </div>
            <div className="p-4">
                {data.destaque && (
                    <div className="mb-2">
                        <Badge tone="accent">✨ Destaque</Badge>
                    </div>
                )}
                <h5 className="mb-1 text-lg font-display font-semibold text-gray-900">{data.titulo}</h5>
                <p className="text-sm text-gray-500 mb-2">{data.cidade} — {data.quartos} quarto(s)</p>
                <p className="mb-1 font-display font-bold text-xl text-brand-800">
                    R$ {Number(data.preco).toLocaleString("pt-br", { minimumFractionDigits: 2 })}
                    <span className="text-sm font-sans font-normal text-gray-500">/mês</span>
                </p>
                {data.avaliacaoMedia != null && (
                    <p className="text-sm text-accent-600 mb-1">★ {data.avaliacaoMedia.toFixed(1)}</p>
                )}
            </div>
        </Link>
    )
}
