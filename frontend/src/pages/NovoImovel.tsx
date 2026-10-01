import { useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { obterClienteToken } from "../utils/auth"
import { GerenciarFotos } from "../components/GerenciarFotos"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import type { ImagemType } from "../utils/types"

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
    const token = obterClienteToken()
    const { register, handleSubmit, watch, setValue } = useForm<Inputs>()
    const navigate = useNavigate()
    const [gerandoIA, setGerandoIA] = useState(false)
    const [imovelCriado, setImovelCriado] = useState<{ id: number, imagens: ImagemType[] }>()

    async function gerarComIA() {
        if (!token) return

        const { titulo, cidade, endereco, quartos } = watch()
        if (!titulo || !cidade || !endereco || !quartos) {
            toast.error("Preencha título, endereço, cidade e quartos antes de gerar com IA")
            return
        }

        setGerandoIA(true)
        const response = await fetch(`${apiUrl}/imovel/sugestao-ia`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

    async function cadastrar(data: Inputs) {
        if (!token) return

        const response = await fetch(`${apiUrl}/imovel`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                ...data,
                preco: Number(data.preco),
                quartos: Number(data.quartos)
            })
        })

        const resultado = await response.json()
        if (!response.ok) {
            toast.error("Não foi possível cadastrar o imóvel")
            return
        }

        toast.success("Imóvel cadastrado! Agora adicione algumas fotos.")
        setImovelCriado({ id: resultado.id, imagens: [] })
    }

    async function atualizarImagens() {
        if (!imovelCriado) return
        const response = await fetch(`${apiUrl}/imovel/${imovelCriado.id}`)
        const dados = await response.json()
        setImovelCriado({ id: imovelCriado.id, imagens: dados.imagens })
    }

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (imovelCriado) {
        return (
            <div className="max-w-lg mx-auto mt-6">
                <Card className="p-8">
                    <h1 className="text-2xl font-display font-semibold text-brand-900 mb-1">Adicionar fotos</h1>
                    <p className="text-sm text-gray-500 mb-5">
                        Opcional, mas imóveis com fotos recebem muito mais interesse. Dá pra adicionar mais depois também.
                    </p>
                    <GerenciarFotos imovelId={imovelCriado.id} imagens={imovelCriado.imagens} onAtualizar={atualizarImagens} />
                    <Button onClick={() => navigate(`/imovel/${imovelCriado.id}`)} className="w-full mt-5">
                        Concluir e ver anúncio
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-lg mx-auto mt-6">
            <Card className="p-8">
                <h1 className="text-2xl font-display font-semibold text-brand-900 mb-5">Anunciar imóvel</h1>
                <form onSubmit={handleSubmit(cadastrar)} className="flex flex-col gap-3">
                    <input placeholder="Título" className="p-3 border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" required {...register("titulo")} />
                    <input placeholder="Endereço" className="p-3 border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" required {...register("endereco")} />
                    <input placeholder="Cidade" className="p-3 border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" required {...register("cidade")} />
                    <input type="number" placeholder="Quartos" className="p-3 border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" required {...register("quartos")} />

                    <Button type="button" variant="accent" onClick={gerarComIA} disabled={gerandoIA}>
                        {gerandoIA ? "Gerando..." : "✨ Gerar descrição e preço com IA"}
                    </Button>

                    <textarea placeholder="Descrição" className="p-3 border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" rows={4} {...register("descricao")} />
                    <input type="number" step="0.01" placeholder="Preço mensal (R$)" className="p-3 border border-cream-200 bg-cream-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400" required {...register("preco")} />

                    <Button type="submit" className="mt-2">
                        Cadastrar
                    </Button>
                </form>
            </Card>
        </div>
    )
}
