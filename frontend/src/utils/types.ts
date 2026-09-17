export type UsuarioType = {
    id: string
    nome: string
    email: string
}

export type ImagemType = {
    id: number
    url: string
    ordem: number
    capa: boolean
}

export type InsightIA = {
    disponivel: boolean
    fonte: "IA"
    texto?: string
    motivo?: string
}

export type ReservaResumo = {
    nota: number | null
    avaliacao: string | null
    respostaAdmin: string | null
    cliente: { nome: string }
}

export type ImovelType = {
    id: number
    proprietarioId: string
    titulo: string
    descricao: string | null
    preco: string
    endereco: string
    cidade: string
    quartos: number
    destaque: boolean
    imagens: ImagemType[]
    avaliacaoMedia?: number | null
    proprietario?: { id: string, nome: string }
    reservas?: ReservaResumo[]
    insightIA?: InsightIA
}

export type StatusReserva = "PENDENTE" | "CONFIRMADA" | "CANCELADA"

export type ReservaType = {
    id: number
    imovelId: number
    clienteId: string
    status: StatusReserva
    dataInicio: string
    dataFim: string
    nota: number | null
    avaliacao: string | null
    respostaAdmin: string | null
    valorTotal: number
    imovel?: { id: number, titulo: string, cidade: string }
    cliente?: { id: string, nome: string, email: string }
}

export type DashboardType = {
    totalImoveis: number
    totalUsuarios: number
    totalReservas: number
    mediaNotas: number | null
    reservasPorStatus: { status: StatusReserva, total: number }[]
    imoveisPorCidade: { cidade: string, total: number }[]
}
