import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ImovelCard } from "../components/ImovelCard"
import { Button } from "../components/ui/Button"
import type { ImovelType } from "../utils/types"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
    termo: string
}

export default function Home() {
    const [imoveis, setImoveis] = useState<ImovelType[]>([])
    const [somenteDestaques, setSomenteDestaques] = useState(false)
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
                <h1 className="mb-3 text-4xl md:text-6xl font-display font-bold text-ink-900 leading-tight tracking-tight">
                    Encontre o imóvel <span className="text-accent-500">certo pra você</span>
                </h1>
                <p className="text-ink-400 text-lg">Aluguel de imóveis com praticidade, do anúncio até a chave na mão.</p>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
                <form className="flex-1 min-w-64" onSubmit={handleSubmit(enviaPesquisa)}>
                    <div className="flex bg-white rounded-xl shadow-lg shadow-ink-900/5 overflow-hidden">
                        <input
                            type="search"
                            placeholder="Buscar por título, cidade ou descrição"
                            className="flex-1 px-5 py-3 text-sm outline-none"
                            {...register("termo")}
                        />
                        <button
                            type="submit"
                            className="px-5 py-3 text-sm font-semibold text-ink-900 bg-accent-400 hover:bg-accent-500 transition-colors"
                        >
                            Pesquisar
                        </button>
                    </div>
                </form>
                <Button
                    type="button"
                    variant={somenteDestaques ? "outline" : "primary"}
                    onClick={somenteDestaques ? mostraTodos : mostraDestaques}
                >
                    {somenteDestaques ? "Ver todos" : "✨ Exibir destaques"}
                </Button>
            </div>

            {imoveis.length === 0 ? (
                <p className="text-ink-200 text-center py-12">Nenhum imóvel encontrado.</p>
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
