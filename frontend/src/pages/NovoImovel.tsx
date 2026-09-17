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
    const { register, handleSubmit } = useForm<Inputs>()
    const navigate = useNavigate()

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
                <textarea placeholder="Descrição" className="p-3 border border-gray-300 rounded-lg" {...register("descricao")} />
                <input type="number" step="0.01" placeholder="Preço mensal (R$)" className="p-3 border border-gray-300 rounded-lg" required {...register("preco")} />
                <input placeholder="Endereço" className="p-3 border border-gray-300 rounded-lg" required {...register("endereco")} />
                <input placeholder="Cidade" className="p-3 border border-gray-300 rounded-lg" required {...register("cidade")} />
                <input type="number" placeholder="Quartos" className="p-3 border border-gray-300 rounded-lg" required {...register("quartos")} />
                <button type="submit" className="p-3 text-white bg-emerald-700 rounded-lg hover:bg-emerald-800">
                    Cadastrar
                </button>
            </form>
        </div>
    )
}
