import { Router } from "express"
import { z } from 'zod'
import { prisma } from "../../lib/prisma"
import { hashSenha, compararSenha, gerarToken, autenticarAdmin } from "../../lib/auth"
import { limiteAutenticacao } from "../../lib/rateLimit"

const router = Router()

const adminSchema = z.object({
    nome: z.string().min(3, { message: "Nome deve possuir, no mínimo, 3 caracteres" }),
    email: z.email(),
    senha: z.string().min(6, { message: "Senha deve possuir, no mínimo, 6 caracteres" })
})

const loginSchema = z.object({
    email: z.email(),
    senha: z.string()
})

const semSenha = { id: true, nome: true, email: true }

// Só é pública enquanto não existe nenhum admin (bootstrap do sistema).
// Depois do primeiro, criar outro admin exige estar logado como admin.
router.post("/cadastro", limiteAutenticacao, async (req, res) => {
    const valida = adminSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const totalAdmins = await prisma.admin.count()
    if (totalAdmins > 0) {
        autenticarAdmin(req, res, async () => {
            await criarAdmin(req, res, valida.data)
        })
        return
    }

    await criarAdmin(req, res, valida.data)
})

async function criarAdmin(req: any, res: any, { nome, email, senha }: { nome: string, email: string, senha: string }) {
    try {
        const admin = await prisma.admin.create({
            data: { nome, email, senha: await hashSenha(senha) },
            select: semSenha
        })
        res.status(201).json(admin)
    } catch (error: any) {
        if (error.code === "P2002") {
            res.status(409).json({ erro: "Já existe um admin com este email" })
            return
        }
        console.error(error)
        res.status(400).json({ erro: "Não foi possível criar o admin" })
    }
}

router.post("/login", limiteAutenticacao, async (req, res) => {
    const valida = loginSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { email, senha } = valida.data

    try {
        const admin = await prisma.admin.findUnique({ where: { email } })

        if (!admin || !(await compararSenha(senha, admin.senha))) {
            res.status(401).json({ erro: "Email ou senha inválidos" })
            return
        }

        const token = gerarToken(admin.id, "admin")
        res.status(200).json({
            token,
            admin: { id: admin.id, nome: admin.nome, email: admin.email }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: "Não foi possível completar o login" })
    }
})

router.get("/me", autenticarAdmin, async (req, res) => {
    try {
        const admin = await prisma.admin.findUnique({
            where: { id: req.usuario!.id },
            select: semSenha
        })

        if (!admin) {
            res.status(404).json({ erro: "Admin não encontrado" })
            return
        }

        res.status(200).json(admin)
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: "Não foi possível carregar os dados do admin" })
    }
})

export default router
