import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ImovelCard } from "../components/ImovelCard"
import { Button } from "../components/ui/Button"
import type { ImovelType, InsightIA } from "../utils/types"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
    termo: string
}

type InsightDestaque = {
    imovel: { id: number, titulo: string, cidade: string } | null
    insightIA: InsightIA | null
}

export default function Home() {
    const [imoveis, setImoveis] = useState<ImovelType[]>([])
    const [somenteDestaques, setSomenteDestaques] = useState(false)
    const [insight, setInsight] = useState<InsightDestaque>()
    const { register, handleSubmit, reset } = useForm<Inputs>()

    async function buscarImoveis(termo?: string, destaque?: boolean) {
        const params = new URLSearchParams()
        if (termo) params.set("busca", termo)
        if (destaque) params.set("destaque", "true")
        params.set("ordenar", "avaliacao")

        const response = await fetch(`${apiUrl}/imovel?${params.toString()}`)
        const dados = await response.json()
        setImoveis(dados)
    }

    useEffect(() => {
        buscarImoveis()

        async function buscarInsight() {
            const response = await fetch(`${apiUrl}/imovel/insight-destaque`)
            if (response.ok) setInsight(await response.json())
        }
        buscarInsight()
    }, [])

    async function enviaPesquisa(data: Inputs) {
        if (data.termo.length < 2) {
            toast.error("Informe, no mínimo, 2 caracteres")
            return
        }
        setSomenteDestaques(false)
        await buscarImoveis(data.termo)
    }

    async function mostraDestaques() {
        reset({ termo: "" })
        setSomenteDestaques(true)
        await buscarImoveis(undefined, true)
    }

    async function mostraTodos() {
        reset({ termo: "" })
        setSomenteDestaques(false)
        await buscarImoveis()
    }

    return (
        <>
            <div className="mb-8 pt-4">
                <h1 className="mb-3 text-4xl md:text-6xl font-display font-semibold text-brand-900 leading-tight">
                    Encontre o imóvel <span className="text-accent-500">certo pra você</span>
                </h1>
                <p className="text-gray-500 text-lg">Aluguel de imóveis com praticidade, do anúncio até a chave na mão.</p>
            </div>

            {insight?.imovel && insight.insightIA && (
                <div className="mb-8 p-5 bg-accent-50 border border-accent-200 rounded-2xl">
                    <p className="text-xs font-semibold text-accent-700 mb-1.5 uppercase tracking-wide">
                        ✨ Dado obtido por consulta a uma IA — sobre {insight.imovel.titulo}
                    </p>
                    {insight.insightIA.disponivel ? (
                        <p className="text-accent-900 text-sm leading-relaxed">{insight.insightIA.texto}</p>
                    ) : (
                        <p className="text-accent-700 text-sm italic">
                            Insight indisponível no momento ({insight.insightIA.motivo}).
                        </p>
                    )}
                    <Link to={`/imovel/${insight.imovel.id}`} className="text-sm text-accent-700 font-medium underline mt-2 inline-block">
                        Ver imóvel
                    </Link>
                </div>
            )}

            <div className="flex flex-wrap gap-3 mb-8">
                <form className="flex-1 min-w-64" onSubmit={handleSubmit(enviaPesquisa)}>
                    <div className="flex bg-white rounded-full shadow-sm border border-cream-200 overflow-hidden">
                        <input
                            type="search"
                            placeholder="Buscar por título, cidade ou descrição"
                            className="flex-1 px-5 py-3 text-sm outline-none"
                            {...register("termo")}
                        />
                        <button
                            type="submit"
                            className="px-5 py-3 text-sm font-medium text-white bg-brand-700 hover:bg-brand-800 transition-colors"
                        >
                            Pesquisar
                        </button>
                    </div>
                </form>
                <Button
                    type="button"
                    variant={somenteDestaques ? "outline" : "accent"}
                    className="rounded-full"
                    onClick={somenteDestaques ? mostraTodos : mostraDestaques}
                >
                    {somenteDestaques ? "Ver todos" : "✨ Exibir destaques"}
                </Button>
            </div>

            {imoveis.length === 0 ? (
                <p className="text-gray-400 text-center py-12">Nenhum imóvel encontrado.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {imoveis.map(imovel => (
                        <ImovelCard data={imovel} key={imovel.id} />
                    ))}
                </div>
            )}
        </>
    )
}
