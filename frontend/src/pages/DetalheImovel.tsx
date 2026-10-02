import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { ImovelType } from "../utils/types"
import { obterCliente } from "../utils/auth"
import { resolverUrlImagem } from "../utils/imagem"
import { GerenciarFotos } from "../components/GerenciarFotos"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
    dataInicio: string
    dataFim: string
}

export default function DetalheImovel() {
    const params = useParams()
    const [imovel, setImovel] = useState<ImovelType>()
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
        if (!obterCliente() || !imovel) return

        if (!data.dataInicio || !data.dataFim) {
            toast.error("Informe as datas de início e fim")
            return
        }

        const response = await fetch(`${apiUrl}/reserva`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
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

    if (!imovel) {
        return <p className="text-ink-200 text-center py-12">Carregando...</p>
    }

    const capa = imovel.imagens.find(img => img.capa) ?? imovel.imagens[0]
    const ehDono = cliente?.id === imovel.proprietarioId

    return (
        <div className="max-w-4xl mx-auto">
            <div className="h-72 md:h-96 bg-paper-50 rounded-xl mb-6 flex items-center justify-center overflow-hidden shadow-lg shadow-ink-900/5">
                {capa ? (
                    <img src={resolverUrlImagem(capa.url)} alt={imovel.titulo} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-ink-200">Sem foto</span>
                )}
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold text-ink-900 tracking-tight">{imovel.titulo}</h1>
            <p className="text-ink-400 mb-3">{imovel.endereco}, {imovel.cidade} — {imovel.quartos} quarto(s)</p>
            <p className="text-3xl font-display font-bold text-ink-900 mb-5">
                R$ {Number(imovel.preco).toLocaleString("pt-br", { minimumFractionDigits: 2 })}
                <span className="text-base font-sans font-normal text-ink-400">/mês</span>
            </p>

            {imovel.descricao && <p className="text-ink-700 leading-relaxed mb-6">{imovel.descricao}</p>}

            {imovel.insightIA && (
                <div className="mb-6 p-5 bg-accent-100 border border-accent-400/30 rounded-xl">
                    <p className="text-xs font-semibold text-ink-900 mb-1.5 uppercase tracking-wide">
                        ✨ Dado obtido por consulta a uma IA
                    </p>
                    {imovel.insightIA.disponivel ? (
                        <p className="text-ink-900 text-sm leading-relaxed">{imovel.insightIA.texto}</p>
                    ) : (
                        <p className="text-ink-600 text-sm italic">
                            Insight indisponível no momento ({imovel.insightIA.motivo}).
                        </p>
                    )}
                </div>
            )}

            {ehDono && (
                <Card className="mb-6">
                    <h2 className="text-lg font-display font-semibold text-ink-900 mb-3">Gerenciar fotos</h2>
                    <GerenciarFotos imovelId={imovel.id} imagens={imovel.imagens} onAtualizar={buscarImovel} />
                </Card>
            )}

            <div className="border-t border-line-200 pt-6 mb-6">
                <h2 className="text-xl font-display font-semibold text-ink-900 mb-3">Reservar</h2>

                {!cliente ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                        Você precisa <Link to="/login" className="underline font-semibold">entrar</Link> para
                        interagir com este imóvel (reservar, avaliar).
                    </div>
                ) : ehDono ? (
                    <p className="text-ink-200 text-sm">Você é o proprietário deste imóvel.</p>
                ) : (
                    <form onSubmit={handleSubmit(reservar)} className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-sm text-ink-400 mb-1">Data início</label>
                            <input type="date" className="p-2.5 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400" required {...register("dataInicio")} />
                        </div>
                        <div>
                            <label className="block text-sm text-ink-400 mb-1">Data fim</label>
                            <input type="date" className="p-2.5 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400" required {...register("dataFim")} />
                        </div>
                        <Button
                            type="submit"
                            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
                        >
                            Reservar
                        </Button>
                    </form>
                )}
            </div>

            {imovel.reservas && imovel.reservas.length > 0 && (
                <div className="border-t border-line-200 pt-6">
                    <h2 className="text-xl font-display font-semibold text-ink-900 mb-3">Avaliações</h2>
                    <div className="flex flex-col gap-3">
                        {imovel.reservas.map((r, i) => (
                            <Card key={i} className="p-4">
                                <p className="text-sm font-semibold text-ink-900">
                                    {r.cliente.nome} {r.nota && <span className="text-accent-600">— ★ {r.nota}</span>}
                                </p>
                                {r.avaliacao && <p className="text-sm text-ink-600 mt-1">{r.avaliacao}</p>}
                                {r.respostaAdmin && (
                                    <p className="text-sm text-ink-700 mt-2 pl-3 border-l-2 border-accent-400">{r.respostaAdmin}</p>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
