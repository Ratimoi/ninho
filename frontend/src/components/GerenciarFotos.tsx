import { useRef, useState } from "react"
import { toast } from "sonner"
import type { ImagemType } from "../utils/types"
import { obterClienteToken } from "../utils/auth"
import { resolverUrlImagem } from "../utils/imagem"

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
        const token = obterClienteToken()
        if (!token || !arquivos || arquivos.length === 0) return

        const formData = new FormData()
        Array.from(arquivos).forEach(arquivo => formData.append("imagens", arquivo))

        setEnviandoFotos(true)
        const response = await fetch(`${apiUrl}/imovel/${imovelId}/imagens`, {
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
        onAtualizar()
    }

    async function anexarPorUrl() {
        const token = obterClienteToken()
        if (!token || !urlFoto.trim()) return

        const response = await fetch(`${apiUrl}/imovel/${imovelId}/imagens/url`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
        const token = obterClienteToken()
        if (!token) return

        await fetch(`${apiUrl}/imovel/${imovelId}/imagens/${imagemId}/capa`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` }
        })
        onAtualizar()
    }

    async function excluirFoto(imagemId: number) {
        const token = obterClienteToken()
        if (!token) return
        if (!confirm("Excluir esta foto?")) return

        await fetch(`${apiUrl}/imovel/${imovelId}/imagens/${imagemId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        onAtualizar()
    }

    return (
        <div>
            {imagens.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                    {imagens.map(img => (
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

            <div className="flex flex-col gap-2">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Enviar do computador</label>
                    <input
                        ref={inputArquivoRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => enviarArquivos(e.target.files)}
                        disabled={enviandoFotos}
                        className="text-sm"
                    />
                    {enviandoFotos && <p className="text-sm text-gray-500 mt-1">Enviando...</p>}
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Ou colar o link de uma foto já hospedada</label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            placeholder="https://..."
                            value={urlFoto}
                            onChange={e => setUrlFoto(e.target.value)}
                            className="flex-1 p-2 text-sm border border-gray-300 rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={anexarPorUrl}
                            className="px-3 py-2 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-800"
                        >
                            Anexar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
