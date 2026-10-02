import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { obterCliente, salvarCliente, sairCliente } from "../utils/auth"
import type { ImovelType } from "../utils/types"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { IconButton } from "../components/ui/IconButton"

const apiUrl = import.meta.env.VITE_API_URL

type DadosInputs = {
    nome: string
    email: string
}

type SenhaInputs = {
    senhaAtual: string
    novaSenha: string
}

export default function Perfil() {
    const cliente = obterCliente()
    const navigate = useNavigate()
    const [meusImoveis, setMeusImoveis] = useState<ImovelType[]>()

    const dadosForm = useForm<DadosInputs>({ defaultValues: { nome: cliente?.nome, email: cliente?.email } })
    const senhaForm = useForm<SenhaInputs>()

    useEffect(() => {
        if (!cliente) return
        async function buscar() {
            const response = await fetch(`${apiUrl}/imovel`)
            const dados: ImovelType[] = await response.json()
            setMeusImoveis(dados.filter(imovel => imovel.proprietarioId === cliente!.id))
        }
        buscar()
    }, [])

    async function salvarDados(data: DadosInputs) {
        const response = await fetch(`${apiUrl}/usuario/me`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const resultado = await response.json()
            toast.error(resultado.erro?.issues?.[0]?.message ?? "Não foi possível atualizar seus dados")
            return
        }

        const usuario = await response.json()
        salvarCliente(usuario)
        toast.success("Dados atualizados!")
    }

    async function trocarSenha(data: SenhaInputs) {
        if (!cliente) return

        const loginConfere = await fetch(`${apiUrl}/usuario/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cliente.email, senha: data.senhaAtual })
        })
        if (!loginConfere.ok) {
            toast.error("Senha atual incorreta")
            return
        }

        const response = await fetch(`${apiUrl}/usuario/me`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ senha: data.novaSenha })
        })

        if (!response.ok) {
            toast.error("Não foi possível trocar a senha")
            return
        }

        senhaForm.reset()
        toast.success("Senha atualizada!")
    }

    async function excluirImovel(id: number) {
        if (!confirm("Excluir este imóvel? Essa ação não pode ser desfeita.")) return

        const response = await fetch(`${apiUrl}/imovel/${id}`, {
            method: "DELETE",
            credentials: "include"
        })

        if (!response.ok) {
            const resultado = await response.json()
            toast.error(resultado.erro ?? "Não foi possível excluir o imóvel")
            return
        }

        toast.success("Imóvel excluído")
        setMeusImoveis(meusImoveis?.filter(imovel => imovel.id !== id))
    }

    async function excluirConta() {
        if (!confirm("Excluir sua conta? Essa ação não pode ser desfeita.")) return

        const response = await fetch(`${apiUrl}/usuario/me`, {
            method: "DELETE",
            credentials: "include"
        })

        if (!response.ok) {
            const resultado = await response.json()
            toast.error(resultado.erro ?? "Não foi possível excluir sua conta")
            return
        }

        await sairCliente()
        toast.success("Conta excluída. Até mais!")
        navigate("/")
    }

    if (!cliente) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <h1 className="text-3xl font-display font-bold text-ink-900 tracking-tight">Meu perfil</h1>

            <Card>
                <h2 className="text-lg font-display font-semibold text-ink-900 mb-4">Dados da conta</h2>
                <form onSubmit={dadosForm.handleSubmit(salvarDados)} className="flex flex-col gap-3">
                    <div>
                        <label className="block text-sm text-ink-400 mb-1">Nome</label>
                        <input
                            className="w-full p-2.5 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                            required
                            minLength={3}
                            {...dadosForm.register("nome")}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-ink-400 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full p-2.5 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                            required
                            {...dadosForm.register("email")}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="self-start text-sm px-4 py-2"
                        icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    >
                        Salvar dados
                    </Button>
                </form>
            </Card>

            <Card>
                <h2 className="text-lg font-display font-semibold text-ink-900 mb-4">Trocar senha</h2>
                <form onSubmit={senhaForm.handleSubmit(trocarSenha)} className="flex flex-col gap-3">
                    <div>
                        <label className="block text-sm text-ink-400 mb-1">Senha atual</label>
                        <input
                            type="password"
                            className="w-full p-2.5 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                            required
                            {...senhaForm.register("senhaAtual")}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-ink-400 mb-1">Nova senha</label>
                        <input
                            type="password"
                            className="w-full p-2.5 border border-line-200 bg-paper-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-400"
                            required
                            minLength={6}
                            {...senhaForm.register("novaSenha")}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="self-start text-sm px-4 py-2"
                        icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
                    >
                        Trocar senha
                    </Button>
                </form>
            </Card>

            <Card>
                <h2 className="text-lg font-display font-semibold text-ink-900 mb-4">Meus imóveis</h2>
                {!meusImoveis ? (
                    <p className="text-sm text-ink-200">Carregando...</p>
                ) : meusImoveis.length === 0 ? (
                    <p className="text-sm text-ink-200">
                        Você ainda não anunciou nenhum imóvel. <Link to="/imovel/novo" className="text-accent-600 font-medium underline">Anunciar agora</Link>.
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {meusImoveis.map(imovel => (
                            <div key={imovel.id} className="relative p-3 pr-12 bg-paper-50 rounded-xl">
                                <div className="min-w-0">
                                    <Link to={`/imovel/${imovel.id}`} className="font-medium text-ink-900 hover:underline truncate block">
                                        {imovel.titulo}
                                    </Link>
                                    <p className="text-xs text-ink-400">{imovel.cidade} — R$ {Number(imovel.preco).toLocaleString("pt-br")}</p>
                                </div>
                                {imovel.destaque && (
                                    <div className="mt-1.5">
                                        <Badge tone="accent">Destaque</Badge>
                                    </div>
                                )}
                                <IconButton
                                    tone="danger"
                                    aria-label="Excluir imóvel"
                                    onClick={() => excluirImovel(imovel.id)}
                                    className="absolute top-2 right-2"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" /></svg>
                                </IconButton>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Card>
                <h2 className="text-lg font-display font-semibold text-ink-900 mb-2">Minhas reservas</h2>
                <p className="text-sm text-ink-400">
                    Acompanhe suas reservas e avaliações em <Link to="/minhas-reservas" className="text-accent-600 font-medium underline">Minhas reservas</Link>.
                </p>
            </Card>

            <div className="bg-white rounded-xl shadow-lg shadow-ink-900/5 border border-red-200 p-5">
                <h2 className="text-lg font-display font-semibold text-red-700 mb-2">Zona de risco</h2>
                <p className="text-sm text-ink-400 mb-3">
                    Excluir sua conta é permanente. Você precisa excluir seus imóveis e não ter reservas pendentes antes.
                </p>
                <Button
                    onClick={excluirConta}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    Excluir minha conta
                </Button>
            </div>
        </div>
    )
}
