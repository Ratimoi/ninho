import { useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { obterClienteToken } from "../utils/auth"

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

        toast.success("Imóvel cadastrado!")
        navigate(`/imovel/${resultado.id}`)
    }

    if (!token) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Anunciar imóvel</h1>
            <form onSubmit={handleSubmit(cadastrar)} className="flex flex-col gap-3">
                <input placeholder="Título" className="p-3 border border-gray-300 rounded-lg" required {...register("titulo")} />
                <input placeholder="Endereço" className="p-3 border border-gray-300 rounded-lg" required {...register("endereco")} />
                <input placeholder="Cidade" className="p-3 border border-gray-300 rounded-lg" required {...register("cidade")} />
                <input type="number" placeholder="Quartos" className="p-3 border border-gray-300 rounded-lg" required {...register("quartos")} />

                <button
                    type="button"
                    onClick={gerarComIA}
                    disabled={gerandoIA}
                    className="p-3 text-sky-800 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 disabled:opacity-60"
                >
                    {gerandoIA ? "Gerando..." : "✨ Gerar descrição e preço com IA"}
                </button>

                <textarea placeholder="Descrição" className="p-3 border border-gray-300 rounded-lg" rows={4} {...register("descricao")} />
                <input type="number" step="0.01" placeholder="Preço mensal (R$)" className="p-3 border border-gray-300 rounded-lg" required {...register("preco")} />

                <button type="submit" className="p-3 text-white bg-emerald-700 rounded-lg hover:bg-emerald-800">
                    Cadastrar
                </button>
            </form>
        </div>
    )
}
