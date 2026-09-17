import { Router } from "express"
import { z } from 'zod'
import path from "path"
import fs from "fs"
import { prisma } from "../../lib/prisma"
import { autenticarCliente, autenticarQualquer } from "../../lib/auth"
import { gerarInsightImovel } from "../../lib/ai"
import { upload, pastaUploads } from "../../lib/upload"

const router = Router()

const imovelSchema = z.object({
    titulo: z.string().min(3),
    descricao: z.string().optional(),
    preco: z.number().positive(),
    endereco: z.string().min(3),
    cidade: z.string().min(2),
    quartos: z.number().int().positive()
})

function calcularMedia(reservas: { nota: number | null }[]) {
    const notas = reservas.map(r => r.nota).filter((n): n is number => n !== null)
    if (notas.length === 0) return null
    return Number((notas.reduce((soma, n) => soma + n, 0) / notas.length).toFixed(1))
}

// Requisitos 1 e 2: listagem principal com busca e destaque.
router.get("/", async (req, res) => {
    const { busca, cidade, destaque, ordenar } = req.query

    try {
        const imoveis = await prisma.imovel.findMany({
            where: {
                ...(destaque === "true" ? { destaque: true } : {}),
                ...(cidade ? { cidade: { contains: String(cidade), mode: "insensitive" } } : {}),
                ...(busca ? {
                    OR: [
                        { titulo: { contains: String(busca), mode: "insensitive" } },
                        { descricao: { contains: String(busca), mode: "insensitive" } },
                        { cidade: { contains: String(busca), mode: "insensitive" } }
                    ]
                } : {})
            },
            include: {
                imagens: { orderBy: { ordem: "asc" } },
                reservas: { select: { nota: true } }
            },
            orderBy: { id: "desc" }
        })

        let resultado = imoveis.map(({ reservas, ...imovel }) => ({
            ...imovel,
            avaliacaoMedia: calcularMedia(reservas)
        }))

        if (ordenar === "avaliacao") {
            resultado = resultado.sort((a, b) => (b.avaliacaoMedia ?? -1) - (a.avaliacaoMedia ?? -1))
        }

        res.status(200).json(resultado)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.get("/:id", async (req, res) => {
    const id = Number(req.params.id)

    try {
        const imovel = await prisma.imovel.findUnique({
            where: { id },
            include: {
                imagens: { orderBy: { ordem: "asc" } },
                proprietario: { select: { id: true, nome: true } },
                reservas: {
                    where: { NOT: { avaliacao: null } },
                    select: { nota: true, avaliacao: true, respostaAdmin: true, cliente: { select: { nome: true } } }
                }
            }
        })

        if (!imovel) {
            res.status(404).json({ erro: "Imóvel não encontrado" })
            return
        }

        // Requisito 3: dados adicionais obtidos por consulta à IA, claramente identificados.
        const insightIA = await gerarInsightImovel({
            titulo: imovel.titulo,
            cidade: imovel.cidade,
            endereco: imovel.endereco,
            quartos: imovel.quartos,
            preco: Number(imovel.preco)
        })

        res.status(200).json({ ...imovel, insightIA })
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.post("/", autenticarCliente, async (req, res) => {
    const valida = imovelSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    try {
        const imovel = await prisma.imovel.create({
            data: { ...valida.data, proprietarioId: req.usuario!.id }
        })
        res.status(201).json(imovel)
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

router.put("/:id", autenticarQualquer, async (req, res) => {
    const id = Number(req.params.id)

    const valida = imovelSchema.partial().safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    try {
        const imovel = await prisma.imovel.findUnique({ where: { id } })
        if (!imovel) {
            res.status(404).json({ erro: "Imóvel não encontrado" })
            return
        }

        const ehDono = req.usuario!.papel === "cliente" && imovel.proprietarioId === req.usuario!.id
        const ehAdmin = req.usuario!.papel === "admin"
        if (!ehDono && !ehAdmin) {
            res.status(403).json({ erro: "Sem permissão para editar este imóvel" })
            return
        }

        const atualizado = await prisma.imovel.update({ where: { id }, data: valida.data })
        res.status(200).json(atualizado)
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

// Requisito 2: admin controla quais imóveis aparecem em destaque.
router.patch("/:id/destaque", autenticarQualquer, async (req, res) => {
    const id = Number(req.params.id)
    const { destaque } = req.body

    if (req.usuario!.papel !== "admin" || typeof destaque !== "boolean") {
        res.status(403).json({ erro: "Apenas admins podem definir destaque" })
        return
    }

    try {
        const imovel = await prisma.imovel.update({ where: { id }, data: { destaque } })
        res.status(200).json(imovel)
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

async function verificarDono(req: any, res: any, imovelId: number) {
    const imovel = await prisma.imovel.findUnique({ where: { id: imovelId } })
    if (!imovel) {
        res.status(404).json({ erro: "Imóvel não encontrado" })
        return null
    }

    const ehDono = req.usuario!.papel === "cliente" && imovel.proprietarioId === req.usuario!.id
    const ehAdmin = req.usuario!.papel === "admin"
    if (!ehDono && !ehAdmin) {
        res.status(403).json({ erro: "Sem permissão para gerenciar as fotos deste imóvel" })
        return null
    }

    return imovel
}

router.post("/:id/imagens", autenticarQualquer, upload.array("imagens", 10), async (req, res) => {
    const id = Number(req.params.id)
    const arquivos = req.files as Express.Multer.File[] | undefined

    if (!arquivos || arquivos.length === 0) {
        res.status(400).json({ erro: "Nenhuma imagem enviada" })
        return
    }

    try {
        const imovel = await verificarDono(req, res, id)
        if (!imovel) return

        const totalAtual = await prisma.imovelImagem.count({ where: { imovelId: id } })

        const criadas = await prisma.$transaction(
            arquivos.map((arquivo, i) =>
                prisma.imovelImagem.create({
                    data: {
                        imovelId: id,
                        url: `/uploads/${arquivo.filename}`,
                        ordem: totalAtual + i,
                        capa: totalAtual === 0 && i === 0
                    }
                })
            )
        )

        res.status(201).json(criadas)
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

router.patch("/:id/imagens/:imagemId/capa", autenticarQualquer, async (req, res) => {
    const id = Number(req.params.id)
    const imagemId = Number(req.params.imagemId)

    try {
        const imovel = await verificarDono(req, res, id)
        if (!imovel) return

        await prisma.$transaction([
            prisma.imovelImagem.updateMany({ where: { imovelId: id }, data: { capa: false } }),
            prisma.imovelImagem.update({ where: { id: imagemId }, data: { capa: true } })
        ])

        res.status(204).send()
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

router.delete("/:id/imagens/:imagemId", autenticarQualquer, async (req, res) => {
    const id = Number(req.params.id)
    const imagemId = Number(req.params.imagemId)

    try {
        const imovel = await verificarDono(req, res, id)
        if (!imovel) return

        const imagem = await prisma.imovelImagem.findUnique({ where: { id: imagemId } })
        if (!imagem || imagem.imovelId !== id) {
            res.status(404).json({ erro: "Imagem não encontrada" })
            return
        }

        await prisma.imovelImagem.delete({ where: { id: imagemId } })

        const caminhoArquivo = path.join(pastaUploads, path.basename(imagem.url))
        fs.unlink(caminhoArquivo, () => {})

        res.status(204).send()
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

router.delete("/:id", autenticarQualquer, async (req, res) => {
    const id = Number(req.params.id)

    try {
        const imovel = await prisma.imovel.findUnique({ where: { id } })
        if (!imovel) {
            res.status(404).json({ erro: "Imóvel não encontrado" })
            return
        }

        const ehDono = req.usuario!.papel === "cliente" && imovel.proprietarioId === req.usuario!.id
        const ehAdmin = req.usuario!.papel === "admin"
        if (!ehDono && !ehAdmin) {
            res.status(403).json({ erro: "Sem permissão para excluir este imóvel" })
            return
        }

        await prisma.imovel.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

export default router
