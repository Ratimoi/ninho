import { Router } from "express"
import { z } from 'zod'
import { prisma } from "../../lib/prisma"
import { hashSenha, compararSenha, gerarToken, autenticarCliente } from "../../lib/auth"

const router = Router()

const usuarioSchema = z.object({
    nome: z.string().min(3, { message: "Nome deve possuir, no mínimo, 3 caracteres" }),
    email: z.email(),
    senha: z.string().min(6, { message: "Senha deve possuir, no mínimo, 6 caracteres" })
})

const loginSchema = z.object({
    email: z.email(),
    senha: z.string()
})

const semSenha = { id: true, nome: true, email: true }

router.post("/cadastro", async (req, res) => {
    const valida = usuarioSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { nome, email, senha } = valida.data

    try {
        const usuario = await prisma.usuario.create({
            data: { nome, email, senha: await hashSenha(senha) },
            select: semSenha
        })
        res.status(201).json(usuario)
    } catch (error: any) {
        if (error.code === "P2002") {
            res.status(409).json({ erro: "Já existe uma conta com este email" })
            return
        }
        res.status(400).json({ erro: error })
    }
})

router.post("/login", async (req, res) => {
    const valida = loginSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { email, senha } = valida.data

    try {
        const usuario = await prisma.usuario.findUnique({ where: { email } })

        if (!usuario || !(await compararSenha(senha, usuario.senha))) {
            res.status(401).json({ erro: "Email ou senha inválidos" })
            return
        }

        const token = gerarToken(usuario.id, "cliente")
        res.status(200).json({
            token,
            usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
        })
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.get("/me", autenticarCliente, async (req, res) => {
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: req.usuario!.id },
            select: semSenha
        })

        if (!usuario) {
            res.status(404).json({ erro: "Usuário não encontrado" })
            return
        }

        res.status(200).json(usuario)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.put("/me", autenticarCliente, async (req, res) => {
    const valida = usuarioSchema.partial().safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const dados = { ...valida.data }
    if (dados.senha) {
        dados.senha = await hashSenha(dados.senha)
    }

    try {
        const usuario = await prisma.usuario.update({
            where: { id: req.usuario!.id },
            data: dados,
            select: semSenha
        })
        res.status(200).json(usuario)
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

router.delete("/me", autenticarCliente, async (req, res) => {
    try {
        await prisma.usuario.delete({ where: { id: req.usuario!.id } })
        res.status(204).send()
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

export default router
