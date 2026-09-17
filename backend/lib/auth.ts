import "dotenv/config"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

const JWT_SECRET = process.env.JWT_SECRET || "segredo-inseguro-dev"

export async function hashSenha(senha: string) {
    return bcrypt.hash(senha, 10)
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

function autenticar(papelEsperado: Papel) {
    return (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ erro: "Token não informado" })
            return
        }

        const token = authHeader.substring("Bearer ".length)

        try {
            const payload = jwt.verify(token, JWT_SECRET) as TokenPayload

            if (payload.papel !== papelEsperado) {
                res.status(403).json({ erro: "Sem permissão para acessar este recurso" })
                return
            }

            req.usuario = payload
            next()
        } catch (error) {
            res.status(401).json({ erro: "Token inválido ou expirado" })
        }
    }
}

export const autenticarCliente = autenticar("cliente")
export const autenticarAdmin = autenticar("admin")

// Aceita tanto cliente quanto admin; o handler decide o que cada papel pode fazer
// (ex: dono do imóvel OU admin podem editar/excluir).
export function autenticarQualquer(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ erro: "Token não informado" })
        return
    }

    const token = authHeader.substring("Bearer ".length)

    try {
        req.usuario = jwt.verify(token, JWT_SECRET) as TokenPayload
        next()
    } catch (error) {
        res.status(401).json({ erro: "Token inválido ou expirado" })
    }
}
