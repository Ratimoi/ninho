import { useEffect, useRef, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { ImovelType } from "../utils/types"
import { obterCliente, obterClienteToken } from "../utils/auth"
import { resolverUrlImagem } from "../utils/imagem"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
    dataInicio: string
    dataFim: string
}

export default function DetalheImovel() {
    const params = useParams()
    const [imovel, setImovel] = useState<ImovelType>()
    const [enviandoFotos, setEnviandoFotos] = useState(false)
    const inputArquivoRef = useRef<HTMLInputElement>(null)
    const cliente = obterCliente()
    const { register, handleSubmit, reset } = useForm<Inputs>()

    async function buscarImovel() {
        const response = await fetch(`${apiUrl}/imovel/${params.imovelId}`)
        if (!response.ok) return
        const dados = await response.json()
        setImovel(dados)
    }

    useEffect(() => {
        buscarImovel()
    }, [])

    async function reservar(data: Inputs) {
        const token = obterClienteToken()
        if (!token || !imovel) return

        if (!data.dataInicio || !data.dataFim) {
            toast.error("Informe as datas de início e fim")
            return
        }

        const response = await fetch(`${apiUrl}/reserva`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                imovelId: imovel.id,
                dataInicio: data.dataInicio,
                dataFim: data.dataFim,
                valorTotal: Number(imovel.preco)
            })
        })

        const resultado = await response.json()
        if (!response.ok) {
            toast.error(resultado.erro ?? "Não foi possível reservar")
            return
        }

        toast.success("Reserva enviada! Acompanhe em 'Minhas reservas'.")
        reset()
    }

    async function enviarFotos(arquivos: FileList | null) {
        const token = obterClienteToken()
        if (!token || !imovel || !arquivos || arquivos.length === 0) return

        const formData = new FormData()
        Array.from(arquivos).forEach(arquivo => formData.append("imagens", arquivo))

        setEnviandoFotos(true)
        const response = await fetch(`${apiUrl}/imovel/${imovel.id}/imagens`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        })
        setEnviandoFotos(false)

        if (!response.ok) {
            toast.error("Não foi possível enviar as fotos")
            return
        }

        if (inputArquivoRef.current) inputArquivoRef.current.value = ""
        toast.success("Fotos enviadas!")
        buscarImovel()
    }

    async function definirCapa(imagemId: number) {
        const token = obterClienteToken()
        if (!token || !imovel) return

        await fetch(`${apiUrl}/imovel/${imovel.id}/imagens/${imagemId}/capa`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` }
        })
        buscarImovel()
    }

    async function excluirFoto(imagemId: number) {
        const token = obterClienteToken()
        if (!token || !imovel) return
        if (!confirm("Excluir esta foto?")) return

        await fetch(`${apiUrl}/imovel/${imovel.id}/imagens/${imagemId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        buscarImovel()
    }

    if (!imovel) {
        return <p className="text-gray-500">Carregando...</p>
    }

    const capa = imovel.imagens.find(img => img.capa) ?? imovel.imagens[0]
    const ehDono = cliente?.id === imovel.proprietarioId

    return (
        <div className="max-w-4xl mx-auto">
            <div className="h-64 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {capa ? (
                    <img src={resolverUrlImagem(capa.url)} alt={imovel.titulo} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-gray-400">Sem foto</span>
                )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{imovel.titulo}</h1>
            <p className="text-gray-600 mb-2">{imovel.endereco}, {imovel.cidade} — {imovel.quartos} quarto(s)</p>
            <p className="text-2xl font-extrabold text-gray-900 mb-4">
                R$ {Number(imovel.preco).toLocaleString("pt-br", { minimumFractionDigits: 2 })}/mês
            </p>

            {imovel.descricao && <p className="text-gray-700 mb-4">{imovel.descricao}</p>}

            {imovel.insightIA && (
                <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                    <p className="text-xs font-semibold text-sky-700 mb-1 uppercase tracking-wide">
                        ✨ Dado obtido por consulta a uma IA
                    </p>
                    {imovel.insightIA.disponivel ? (
                        <p className="text-sky-900 text-sm">{imovel.insightIA.texto}</p>
                    ) : (
                        <p className="text-sky-700 text-sm italic">
                            Insight indisponível no momento ({imovel.insightIA.motivo}).
                        </p>
                    )}
                </div>
            )}

            {ehDono && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Gerenciar fotos</h2>

                    {imovel.imagens.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-3">
                            {imovel.imagens.map(img => (
                                <div key={img.id} className="relative w-24 h-24">
                                    <img
                                        src={resolverUrlImagem(img.url)}
                                        alt=""
                                        className={`w-full h-full object-cover rounded-lg border-2 ${img.capa ? "border-emerald-600" : "border-transparent"}`}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/50 rounded-b-lg py-1">
                                        {!img.capa && (
                                            <button
                                                onClick={() => definirCapa(img.id)}
                                                className="text-[10px] text-white hover:underline"
                                                title="Definir como capa"
                                            >
                                                Capa
                                            </button>
                                        )}
                                        <button
                                            onClick={() => excluirFoto(img.id)}
                                            className="text-[10px] text-red-300 hover:underline"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <input
                        ref={inputArquivoRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => enviarFotos(e.target.files)}
                        disabled={enviandoFotos}
                        className="text-sm"
                    />
                    {enviandoFotos && <p className="text-sm text-gray-500 mt-1">Enviando...</p>}
                </div>
            )}

            <div className="border-t border-gray-200 pt-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Reservar</h2>

                {!cliente ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                        Você precisa <Link to="/login" className="underline font-semibold">entrar</Link> para
                        interagir com este imóvel (reservar, avaliar).
                    </div>
                ) : ehDono ? (
                    <p className="text-gray-500 text-sm">Você é o proprietário deste imóvel.</p>
                ) : (
                    <form onSubmit={handleSubmit(reservar)} className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Data início</label>
                            <input type="date" className="p-2 border border-gray-300 rounded-lg" required {...register("dataInicio")} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Data fim</label>
                            <input type="date" className="p-2 border border-gray-300 rounded-lg" required {...register("dataFim")} />
                        </div>
                        <button type="submit" className="p-2 px-4 text-white bg-emerald-700 rounded-lg hover:bg-emerald-800">
                            Reservar
                        </button>
                    </form>
                )}
            </div>

            {imovel.reservas && imovel.reservas.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Avaliações</h2>
                    <div className="flex flex-col gap-3">
                        {imovel.reservas.map((r, i) => (
                            <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-sm font-semibold text-gray-900">
                                    {r.cliente.nome} {r.nota && `— ★ ${r.nota}`}
                                </p>
                                {r.avaliacao && <p className="text-sm text-gray-700">{r.avaliacao}</p>}
                                {r.respostaAdmin && (
                                    <p className="text-sm text-emerald-700 mt-1">Resposta: {r.respostaAdmin}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
