import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"

import routesImoveis from './routes/imovel'
import routesReservas from './routes/reserva'
import routesUsuarios from './routes/usuario'
import routesAdmin from './routes/admin'
import routesDashboard from './routes/dashboard'

dotenv.config()

const app = express()

// Em produção, restringe o CORS à URL do frontend (definida no deploy).
// Sem essa variável (ex: em dev local), libera qualquer origem.
const origensPermitidas = process.env.FRONTEND_URL
app.use(cors(origensPermitidas ? { origin: origensPermitidas } : undefined))
app.use(express.json())
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

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor está rodando na porta ${PORT}`)
})
