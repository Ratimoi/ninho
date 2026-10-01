import "dotenv/config"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

// Sem fallback inseguro: se faltar, o servidor nem deve subir — rodar com um
// segredo previsível tornaria qualquer token forjável.
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado")
}
const JWT_SECRET: string = process.env.JWT_SECRET

export async function hashSenha(senha: string) {
    return bcrypt.hash(senha, 12)
}

export async function compararSenha(senha: string, hash: string) {
    return bcrypt.compare(senha, hash)
}

type Papel = "cliente" | "admin"

export function gerarToken(id: string, papel: Papel) {
    return jwt.sign({ id, papel }, JWT_SECRET, { expiresIn: "7d" })
}

export interface TokenPayload {
    id: string
    papel: Papel
}

declare global {
    namespace Express {
        interface Request {
            usuario?: TokenPayload
        }
    }
}

const NOME_COOKIE: Record<Papel, string> = {
    cliente: "cliente_token",
    admin: "admin_token"
}

// Frontend (Vercel) e backend (Render) são domínios diferentes — do ponto de
// vista do cookie, isso é "cross-site". Por isso SameSite=None + Secure em
// produção (exigido pelo navegador pra enviar o cookie entre domínios
// diferentes); em dev, front e back são portas do mesmo "localhost" (mesmo
// site), então Lax + sem Secure (http) já funciona.
const emProducao = Boolean(process.env.FRONTEND_URL)

function opcoesCookie() {
    return {
        httpOnly: true,
        secure: emProducao,
        sameSite: (emProducao ? "none" : "lax") as "none" | "lax",
        path: "/"
    }
}

// Token fica só no cookie httpOnly — inacessível a JavaScript no navegador,
// então um XSS não consegue mais roubar a sessão lendo localStorage.
export function definirCookieAuth(res: Response, papel: Papel, token: string) {
    res.cookie(NOME_COOKIE[papel], token, { ...opcoesCookie(), maxAge: 7 * 24 * 60 * 60 * 1000 })
}

export function limparCookieAuth(res: Response, papel: Papel) {
    res.clearCookie(NOME_COOKIE[papel], opcoesCookie())
}

function autenticar(papelEsperado: Papel) {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies?.[NOME_COOKIE[papelEsperado]]

        if (!token) {
            res.status(401).json({ erro: "Não autenticado" })
            return
        }

        try {
            const payload = jwt.verify(token, JWT_SECRET) as TokenPayload

            if (payload.papel !== papelEsperado) {
                res.status(403).json({ erro: "Sem permissão para acessar este recurso" })
                return
            }

            req.usuario = payload
            next()
        } catch (error) {
            res.status(401).json({ erro: "Sessão inválida ou expirada" })
        }
    }
}

export const autenticarCliente = autenticar("cliente")
export const autenticarAdmin = autenticar("admin")

// Aceita tanto cliente quanto admin; o handler decide o que cada papel pode fazer
// (ex: dono do imóvel OU admin podem editar/excluir). Como os dois cookies
// (cliente_token/admin_token) são independentes, dá pra estar logado como os
// dois ao mesmo tempo no mesmo navegador — admin tem prioridade nesse caso.
export function autenticarQualquer(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.[NOME_COOKIE.admin] ?? req.cookies?.[NOME_COOKIE.cliente]

    if (!token) {
        res.status(401).json({ erro: "Não autenticado" })
        return
    }

    try {
        req.usuario = jwt.verify(token, JWT_SECRET) as TokenPayload
        next()
    } catch (error) {
        res.status(401).json({ erro: "Sessão inválida ou expirada" })
    }
}
