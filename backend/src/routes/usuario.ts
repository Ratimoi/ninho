import { Router } from "express"
import { z } from 'zod'
import crypto from "crypto"
import { prisma } from "../../lib/prisma"
import { hashSenha, compararSenha, gerarToken, autenticarCliente, definirCookieAuth, limparCookieAuth } from "../../lib/auth"
import { enviarEmailRecuperacaoSenha, enviarEmailConfirmacaoCadastro } from "../../lib/email"
import { tratarErroPrisma } from "../../lib/erros"
import { limiteAutenticacao } from "../../lib/rateLimit"

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

const esqueciSenhaSchema = z.object({
    email: z.email()
})

const redefinirSenhaSchema = z.object({
    token: z.string().min(1),
    novaSenha: z.string().min(6, { message: "Senha deve possuir, no mínimo, 6 caracteres" })
})

const confirmarEmailSchema = z.object({
    token: z.string().min(1)
})

const TOKEN_VALIDADE_MS = 30 * 60 * 1000
const CONFIRMACAO_VALIDADE_MS = 24 * 60 * 60 * 1000

function hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex")
}

const semSenha = { id: true, nome: true, email: true }

// A conta só é criada de verdade quando o link do e-mail é confirmado —
// até lá, os dados ficam só no cadastro pendente (senha já hasheada).
router.post("/cadastro", limiteAutenticacao, async (req, res) => {
    const valida = usuarioSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { nome, email, senha } = valida.data

    try {
        const usuarioExistente = await prisma.usuario.findUnique({ where: { email } })
        if (usuarioExistente) {
            res.status(409).json({ erro: "Já existe uma conta com este email" })
            return
        }

        const tokenBruto = crypto.randomBytes(32).toString("hex")

        // upsert: se a pessoa tentar cadastrar de novo antes de confirmar
        // (não achou o e-mail, link expirou), reenvia com um token novo em
        // vez de ficar preso no primeiro envio.
        await prisma.cadastroPendente.upsert({
            where: { email },
            create: {
                nome, email,
                senha: await hashSenha(senha),
                token: hashToken(tokenBruto),
                expiraEm: new Date(Date.now() + CONFIRMACAO_VALIDADE_MS)
            },
            update: {
                nome,
                senha: await hashSenha(senha),
                token: hashToken(tokenBruto),
                expiraEm: new Date(Date.now() + CONFIRMACAO_VALIDADE_MS)
            }
        })

        const origemFrontend = process.env.FRONTEND_URL ?? "http://localhost:5173"
        await enviarEmailConfirmacaoCadastro({
            destinatarioEmail: email,
            destinatarioNome: nome,
            link: `${origemFrontend}/confirmar-email?token=${tokenBruto}`
        })

        res.status(200).json({ mensagem: "Enviamos um link de confirmação para o seu e-mail." })
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: "Não foi possível iniciar o cadastro" })
    }
})

router.post("/confirmar-email", limiteAutenticacao, async (req, res) => {
    const valida = confirmarEmailSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    try {
        const pendente = await prisma.cadastroPendente.findFirst({
            where: { token: hashToken(valida.data.token), expiraEm: { gt: new Date() } }
        })

        if (!pendente) {
            res.status(400).json({ erro: "Link inválido ou expirado" })
            return
        }

        const usuario = await prisma.usuario.create({
            data: { nome: pendente.nome, email: pendente.email, senha: pendente.senha },
            select: semSenha
        })

        await prisma.cadastroPendente.delete({ where: { id: pendente.id } })

        const token = gerarToken(usuario.id, "cliente")
        definirCookieAuth(res, "cliente", token)
        res.status(200).json({ usuario })
    } catch (error: any) {
        if (error.code === "P2002") {
            res.status(409).json({ erro: "Já existe uma conta com este email" })
            return
        }
        console.error(error)
        res.status(500).json({ erro: "Não foi possível confirmar o cadastro" })
    }
})

router.post("/login", limiteAutenticacao, async (req, res) => {
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
        definirCookieAuth(res, "cliente", token)
        res.status(200).json({
            usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: "Não foi possível completar o login" })
    }
})

router.post("/logout", (req, res) => {
    limparCookieAuth(res, "cliente")
    res.status(204).send()
})

// Nunca revela se o e-mail existe na base — senão vira um jeito de descobrir
// quais e-mails estão cadastrados (enumeração de contas).
router.post("/esqueci-senha", limiteAutenticacao, async (req, res) => {
    const valida = esqueciSenhaSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const mensagemPadrao = { mensagem: "Se existir uma conta com esse e-mail, enviamos um link de recuperação." }

    try {
        const usuario = await prisma.usuario.findUnique({ where: { email: valida.data.email } })
        if (!usuario) {
            res.status(200).json(mensagemPadrao)
            return
        }

        const tokenBruto = crypto.randomBytes(32).toString("hex")
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { resetToken: hashToken(tokenBruto), resetTokenExpira: new Date(Date.now() + TOKEN_VALIDADE_MS) }
        })

        const origemFrontend = process.env.FRONTEND_URL ?? "http://localhost:5173"
        await enviarEmailRecuperacaoSenha({
            destinatarioEmail: usuario.email,
            destinatarioNome: usuario.nome,
            link: `${origemFrontend}/redefinir-senha?token=${tokenBruto}`
        })

        res.status(200).json(mensagemPadrao)
    } catch (error) {
        console.error(error)
        res.status(200).json(mensagemPadrao)
    }
})

router.post("/redefinir-senha", limiteAutenticacao, async (req, res) => {
    const valida = redefinirSenhaSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    try {
        const usuario = await prisma.usuario.findFirst({
            where: { resetToken: hashToken(valida.data.token), resetTokenExpira: { gt: new Date() } }
        })

        if (!usuario) {
            res.status(400).json({ erro: "Link inválido ou expirado" })
            return
        }

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { senha: await hashSenha(valida.data.novaSenha), resetToken: null, resetTokenExpira: null }
        })

        res.status(200).json({ mensagem: "Senha redefinida com sucesso" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ erro: "Não foi possível redefinir a senha" })
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
        console.error(error)
        res.status(500).json({ erro: "Não foi possível carregar os dados do usuário" })
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
        tratarErroPrisma(error, res)
    }
})

router.delete("/me", autenticarCliente, async (req, res) => {
    try {
        await prisma.usuario.delete({ where: { id: req.usuario!.id } })
        limparCookieAuth(res, "cliente")
        res.status(204).send()
    } catch (error) {
        tratarErroPrisma(error, res, { emUso: "Não é possível excluir a conta: você ainda tem imóveis ou reservas cadastrados" })
    }
})

export default router
