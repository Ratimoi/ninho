import express, { type Request, type Response, type NextFunction } from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import helmet from "helmet"
import { MulterError } from "multer"
import { limiteGeral } from "../lib/rateLimit"

import routesImoveis from './routes/imovel'
import routesReservas from './routes/reserva'
import routesUsuarios from './routes/usuario'
import routesAdmin from './routes/admin'
import routesDashboard from './routes/dashboard'

dotenv.config()

const app = express()

// Atrás do proxy do Render — necessário pra req.ip (usado no rate limit)
// refletir o IP real do cliente, não o do proxy.
app.set("trust proxy", 1)

// Cabeçalhos de segurança padrão (HSTS, X-Content-Type-Options, etc).
// API pura (sem HTML renderizado aqui), então desliga a CSP do helmet —
// quem serve/precisa de CSP é o frontend estático na Vercel.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }))

// CORS antes do rate limit: uma resposta 429 também precisa dos cabeçalhos de
// CORS, senão o navegador descarta a mensagem do limiter como erro de CORS.
// Em produção, restringe o CORS à URL do frontend (definida no deploy).
// Sem essa variável (ex: em dev local), libera qualquer origem.
const origensPermitidas = process.env.FRONTEND_URL
app.use(cors(origensPermitidas ? { origin: origensPermitidas } : undefined))

app.use(limiteGeral)
app.use(express.json({ limit: "1mb" }))
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")))

app.use("/imovel", routesImoveis)
app.use("/reserva", routesReservas)
app.use("/usuario", routesUsuarios)
app.use("/admin", routesAdmin)
app.use("/dashboard", routesDashboard)

app.get("/", (req, res) => {
    res.json({
        message: "API do sistema de aluguel de imóveis está funcionando"
    })
})

// Erros do multer (tipo de arquivo inválido, tamanho acima do limite) chegam
// aqui via next(err) e passariam batido pelo try/catch das rotas normais.
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof MulterError) {
        res.status(400).json({ erro: err.message })
        return
    }
    if (err instanceof Error && err.message === "Somente arquivos de imagem são permitidos") {
        res.status(400).json({ erro: err.message })
        return
    }
    next(err)
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor está rodando na porta ${PORT}`)
})
