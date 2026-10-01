import { Router } from "express"
import { z } from 'zod'
import { prisma } from "../../lib/prisma"
import { autenticarCliente, autenticarAdmin } from "../../lib/auth"
import { enviarEmailResposta } from "../../lib/email"
import { tratarErroPrisma } from "../../lib/erros"

const router = Router()

const reservaSchema = z.object({
    imovelId: z.number().int(),
    dataInicio: z.coerce.date(),
    dataFim: z.coerce.date(),
    valorTotal: z.number().positive()
})

const avaliacaoSchema = z.object({
    nota: z.number().int().min(1).max(5),
    avaliacao: z.string().min(1)
})

const respostaSchema = z.object({
    respostaAdmin: z.string().min(1)
})

const statusSchema = z.object({
    status: z.enum(["PENDENTE", "CONFIRMADA", "CANCELADA"])
})

// Requisito 7: cliente logado vê suas próprias interações e as respostas do admin.
router.get("/minhas", autenticarCliente, async (req, res) => {
    try {
        const reservas = await prisma.reserva.findMany({
            where: { clienteId: req.usuario!.id },
            include: { imovel: { select: { id: true, titulo: true, cidade: true } } },
            orderBy: { id: "desc" }
        })
        res.status(200).json(reservas)
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: "Não foi possível carregar as reservas" })
    }
})

// Requisito 11: admin lista todas as interações dos clientes.
router.get("/", autenticarAdmin, async (req, res) => {
    try {
        const reservas = await prisma.reserva.findMany({
            include: {
                imovel: { select: { id: true, titulo: true, cidade: true } },
                cliente: { select: { id: true, nome: true, email: true } }
            },
            orderBy: { id: "desc" }
        })
        res.status(200).json(reservas)
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: "Não foi possível carregar as interações" })
    }
})

// Interação principal: cliente reserva um imóvel.
router.post("/", autenticarCliente, async (req, res) => {
    const valida = reservaSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { imovelId, dataInicio, dataFim, valorTotal } = valida.data

    if (dataFim <= dataInicio) {
        res.status(400).json({ erro: "dataFim deve ser depois de dataInicio" })
        return
    }

    try {
        const imovel = await prisma.imovel.findUnique({ where: { id: imovelId } })
        if (!imovel) {
            res.status(404).json({ erro: "Imóvel não encontrado" })
            return
        }

        if (imovel.proprietarioId === req.usuario!.id) {
            res.status(400).json({ erro: "Você não pode reservar o próprio imóvel" })
            return
        }

        // Duas reservas do mesmo imóvel não podem se sobrepor (reservas canceladas
        // não contam). Checagem em nível de aplicação: sob concorrência extrema
        // (duas requisições simultâneas) ainda há uma pequena janela de corrida,
        // já que o Postgres não tem aqui uma constraint de exclusão de intervalo.
        const conflito = await prisma.reserva.findFirst({
            where: {
                imovelId,
                status: { not: "CANCELADA" },
                dataInicio: { lt: dataFim },
                dataFim: { gt: dataInicio }
            }
        })
        if (conflito) {
            res.status(409).json({ erro: "Este imóvel já está reservado nesse período" })
            return
        }

        const reserva = await prisma.reserva.create({
            data: { imovelId, dataInicio, dataFim, valorTotal, clienteId: req.usuario!.id }
        })
        res.status(201).json(reserva)
    } catch (error) {
        tratarErroPrisma(error, res)
    }
})

// Cliente avalia (nota + comentário) uma reserva já feita.
router.put("/:id/avaliar", autenticarCliente, async (req, res) => {
    const id = Number(req.params.id)

    const valida = avaliacaoSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    try {
        const reserva = await prisma.reserva.findUnique({ where: { id } })
        if (!reserva || reserva.clienteId !== req.usuario!.id) {
            res.status(404).json({ erro: "Reserva não encontrada" })
            return
        }

        const atualizada = await prisma.reserva.update({ where: { id }, data: valida.data })
        res.status(200).json(atualizada)
    } catch (error) {
        tratarErroPrisma(error, res)
    }
})

// Requisito 11: admin responde à interação do cliente (e envia e-mail com a resposta).
router.put("/:id/responder", autenticarAdmin, async (req, res) => {
    const id = Number(req.params.id)

    const valida = respostaSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    try {
        const reserva = await prisma.reserva.update({
            where: { id },
            data: valida.data,
            include: { imovel: { select: { titulo: true } }, cliente: { select: { nome: true, email: true } } }
        })

        const email = await enviarEmailResposta({
            destinatarioEmail: reserva.cliente.email,
            destinatarioNome: reserva.cliente.nome,
            imovelTitulo: reserva.imovel.titulo,
            resposta: valida.data.respostaAdmin
        })

        res.status(200).json({ ...reserva, email })
    } catch (error) {
        tratarErroPrisma(error, res)
    }
})

// Requisito 11: admin confirma/cancela a interação.
router.put("/:id/status", autenticarAdmin, async (req, res) => {
    const id = Number(req.params.id)

    const valida = statusSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    try {
        const reserva = await prisma.reserva.update({ where: { id }, data: valida.data })
        res.status(200).json(reserva)
    } catch (error) {
        tratarErroPrisma(error, res)
    }
})

// Requisito 11: admin exclui uma interação.
router.delete("/:id", autenticarAdmin, async (req, res) => {
    const id = Number(req.params.id)

    try {
        await prisma.reserva.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        tratarErroPrisma(error, res)
    }
})

export default router
