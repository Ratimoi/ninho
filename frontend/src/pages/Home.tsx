import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ImovelCard } from "../components/ImovelCard"
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
            <h1 className="mb-4 text-3xl md:text-5xl font-extrabold text-gray-900">
                Encontre o imóvel <span className="text-emerald-700">certo pra você</span>
            </h1>

            <div className="flex flex-wrap gap-3 mb-6">
                <form className="flex-1 min-w-64" onSubmit={handleSubmit(enviaPesquisa)}>
                    <div className="flex">
                        <input
                            type="search"
                            placeholder="Buscar por título, cidade ou descrição"
                            className="flex-1 p-3 text-sm border border-gray-300 rounded-l-lg focus:ring-emerald-500 focus:border-emerald-500"
                            {...register("termo")}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-emerald-700 rounded-r-lg hover:bg-emerald-800"
                        >
                            Pesquisar
                        </button>
                    </div>
                </form>
                <button
                    type="button"
                    onClick={somenteDestaques ? mostraTodos : mostraDestaques}
                    className="px-4 py-2 text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                >
                    {somenteDestaques ? "Ver todos" : "Exibir destaques"}
                </button>
            </div>

            {imoveis.length === 0 ? (
                <p className="text-gray-500">Nenhum imóvel encontrado.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {imoveis.map(imovel => (
                        <ImovelCard data={imovel} key={imovel.id} />
                    ))}
                </div>
            )}
        </>
    )
}
