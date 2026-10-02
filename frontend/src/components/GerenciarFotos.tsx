import { useRef, useState } from "react"
import { toast } from "sonner"
import type { ImagemType } from "../utils/types"
import { obterCliente } from "../utils/auth"
import { resolverUrlImagem } from "../utils/imagem"
import { Button } from "./ui/Button"

const apiUrl = import.meta.env.VITE_API_URL

type GerenciarFotosProps = {
    imovelId: number
    imagens: ImagemType[]
    onAtualizar: () => void
}

export function GerenciarFotos({ imovelId, imagens, onAtualizar }: GerenciarFotosProps) {
    const [enviandoFotos, setEnviandoFotos] = useState(false)
    const [urlFoto, setUrlFoto] = useState("")
    const inputArquivoRef = useRef<HTMLInputElement>(null)

    async function enviarArquivos(arquivos: FileList | null) {
        if (!obterCliente() || !arquivos || arquivos.length === 0) return

        const formData = new FormData()
        Array.from(arquivos).forEach(arquivo => formData.append("imagens", arquivo))

        setEnviandoFotos(true)
        const response = await fetch(`${apiUrl}/imovel/${imovelId}/imagens`, {
            method: "POST",
            credentials: "include",
            // multipart/form-data sem headers extras é uma requisição "simples"
            // pro CORS — o navegador não faz preflight, então o cookie (SameSite=None)
            // iria junto numa submissão disparada por outro site. Esse header
            // força o preflight, onde a allowlist de origem do backend barra.
            headers: { "X-Requested-With": "XMLHttpRequest" },
            body: formData
        })
        setEnviandoFotos(false)

        if (!response.ok) {
            toast.error("Não foi possível enviar as fotos")
            return
        }

        if (inputArquivoRef.current) inputArquivoRef.current.value = ""
        toast.success("Fotos enviadas!")
        onAtualizar()
    }

    async function anexarPorUrl() {
        if (!obterCliente() || !urlFoto.trim()) return

        const response = await fetch(`${apiUrl}/imovel/${imovelId}/imagens/url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ url: urlFoto.trim() })
        })

        if (!response.ok) {
            const resultado = await response.json()
            toast.error(resultado.erro?.issues?.[0]?.message ?? "Link de imagem inválido")
            return
        }

        setUrlFoto("")
        toast.success("Foto anexada!")
        onAtualizar()
    }

    async function definirCapa(imagemId: number) {
        if (!obterCliente()) return

        await fetch(`${apiUrl}/imovel/${imovelId}/imagens/${imagemId}/capa`, {
            method: "PATCH",
            credentials: "include"
        })
        onAtualizar()
    }

    async function excluirFoto(imagemId: number) {
        if (!obterCliente()) return
        if (!confirm("Excluir esta foto?")) return

        await fetch(`${apiUrl}/imovel/${imovelId}/imagens/${imagemId}`, {
            method: "DELETE",
            credentials: "include"
        })
        onAtualizar()
    }

    return (
        <div>
            {imagens.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                    {imagens.map(img => (
                        <div key={img.id} className="relative w-24 h-24">
                            <img
                                src={resolverUrlImagem(img.url)}
                                alt=""
                                className={`w-full h-full object-cover rounded-xl border-2 ${img.capa ? "border-accent-400" : "border-transparent"}`}
                            />
                            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 bg-black/55 rounded-b-xl py-1">
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

            <div className="flex flex-col gap-3">
                <div>
                    <label className="block text-sm text-ink-400 mb-1">Enviar do computador</label>
                    <input
                        ref={inputArquivoRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => enviarArquivos(e.target.files)}
                        disabled={enviandoFotos}
                        className="block w-full text-sm text-ink-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-accent-100 file:text-ink-900 hover:file:bg-accent-400 file:cursor-pointer disabled:opacity-50"
                    />
                    {enviandoFotos && <p className="text-sm text-ink-200 mt-1">Enviando...</p>}
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
                        <Button type="button" variant="outline" onClick={anexarPorUrl} className="px-4 py-2 text-sm">
                            Anexar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
