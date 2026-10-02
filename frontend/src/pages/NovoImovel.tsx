import { useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { obterCliente } from "../utils/auth"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
    titulo: string
    descricao: string
    preco: number
    endereco: string
    cidade: string
    quartos: number
}

export default function NovoImovel() {
    const cliente = obterCliente()
    const { register, handleSubmit, watch, setValue } = useForm<Inputs>()
    const navigate = useNavigate()
    const [gerandoIA, setGerandoIA] = useState(false)
    const [cadastrando, setCadastrando] = useState(false)
    const [arquivos, setArquivos] = useState<File[]>([])
    const [urlFoto, setUrlFoto] = useState("")
    const [urls, setUrls] = useState<string[]>([])

    async function gerarComIA() {
        if (!cliente) return

        const { titulo, cidade, endereco, quartos } = watch()
        if (!titulo || !cidade || !endereco || !quartos) {
            toast.error("Preencha título, endereço, cidade e quartos antes de gerar com IA")
            return
        }

        setGerandoIA(true)
        const response = await fetch(`${apiUrl}/imovel/sugestao-ia`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ titulo, cidade, endereco, quartos: Number(quartos) })
        })
        const resultado = await response.json()
        setGerandoIA(false)

        if (!response.ok || !resultado.disponivel) {
            toast.error(`Não foi possível gerar com IA (${resultado.motivo ?? "erro desconhecido"})`)
            return
        }

        setValue("descricao", resultado.descricao)
        setValue("preco", resultado.precoSugerido)
        toast.success("Descrição e preço sugeridos pela IA — revise antes de publicar!")
    }

    function adicionarUrl() {
        if (!urlFoto.trim()) return
        setUrls([...urls, urlFoto.trim()])
        setUrlFoto("")
    }

    function removerUrl(index: number) {
        setUrls(urls.filter((_, i) => i !== index))
    }

    async function cadastrar(data: Inputs) {
        if (!cliente) return

        setCadastrando(true)

        const response = await fetch(`${apiUrl}/imovel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                ...data,
                preco: Number(data.preco),
                quartos: Number(data.quartos)
            })
        })

        if (!response.ok) {
            setCadastrando(false)
            toast.error("Não foi possível cadastrar o imóvel")
            return
        }

        const imovel = await response.json()

        if (arquivos.length > 0) {
            const formData = new FormData()
            arquivos.forEach(arquivo => formData.append("imagens", arquivo))

            const respostaArquivos = await fetch(`${apiUrl}/imovel/${imovel.id}/imagens`, {
                method: "POST",
                credentials: "include",
                headers: { "X-Requested-With": "XMLHttpRequest" },
                body: formData
            })
            if (!respostaArquivos.ok) {
                toast.error("Imóvel cadastrado, mas não foi possível enviar as fotos selecionadas")
            }
        }

        for (const url of urls) {
            const respostaUrl = await fetch(`${apiUrl}/imovel/${imovel.id}/imagens/url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ url })
            })
            if (!respostaUrl.ok) {
                toast.error(`Não foi possível anexar a foto: ${url}`)
            }
        }

        setCadastrando(false)
        toast.success("Imóvel cadastrado!")
        navigate(`/imovel/${imovel.id}`)
    }

    if (!cliente) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="max-w-lg mx-auto mt-6">
            <Card className="p-8">
                <h1 className="text-2xl font-display font-bold text-ink-900 mb-5 tracking-tight">Anunciar imóvel</h1>
                <form onSubmit={handleSubmit(cadastrar)} className="flex flex-col gap-3">
                    <input placeholder="Título" className="p-3 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400" required {...register("titulo")} />
                    <input placeholder="Endereço" className="p-3 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400" required {...register("endereco")} />
                    <input placeholder="Cidade" className="p-3 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400" required {...register("cidade")} />
                    <input type="number" placeholder="Quartos" className="p-3 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400" required {...register("quartos")} />

                    <Button
                        type="button"
                        variant="outline"
                        onClick={gerarComIA}
                        loading={gerandoIA}
                        icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>}
                    >
                        {gerandoIA ? "Gerando..." : "Gerar descrição e preço com IA"}
                    </Button>

                    <textarea placeholder="Descrição" className="p-3 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400" rows={4} {...register("descricao")} />
                    <input type="number" step="0.01" placeholder="Preço mensal (R$)" className="p-3 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400" required {...register("preco")} />

                    <div className="border-t border-line-200 pt-3 mt-1 flex flex-col gap-3">
                        <p className="text-sm font-medium text-ink-700">Fotos (opcional)</p>

                        <div>
                            <label className="block text-sm text-ink-400 mb-1">Enviar do computador</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={e => setArquivos(e.target.files ? Array.from(e.target.files) : [])}
                                className="block w-full text-sm text-ink-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-accent-100 file:text-ink-900 hover:file:bg-accent-400 file:cursor-pointer"
                            />
                            {arquivos.length > 0 && (
                                <p className="text-xs text-ink-400 mt-1">{arquivos.length} arquivo(s) selecionado(s)</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-ink-400 mb-1">Ou colar o link de uma foto já hospedada</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={urlFoto}
                                    onChange={e => setUrlFoto(e.target.value)}
                                    className="flex-1 p-2.5 text-sm border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                                />
                                <Button type="button" variant="outline" onClick={adicionarUrl} className="px-4 py-2 text-sm">
                                    Adicionar
                                </Button>
                            </div>
                            {urls.length > 0 && (
                                <ul className="mt-2 flex flex-col gap-1">
                                    {urls.map((url, i) => (
                                        <li key={i} className="flex items-center justify-between gap-2 text-xs text-ink-400 bg-paper-50 rounded-lg px-2.5 py-1.5">
                                            <span className="truncate">{url}</span>
                                            <button type="button" onClick={() => removerUrl(i)} className="text-red-500 hover:underline shrink-0">
                                                Remover
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="mt-2"
                        loading={cadastrando}
                        icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" /></svg>}
                    >
                        {cadastrando ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                </form>
            </Card>
        </div>
    )
}
