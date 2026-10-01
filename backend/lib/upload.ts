import multer from "multer"
import path from "path"
import crypto from "crypto"
import fs from "fs"

const pastaUploads = path.join(__dirname, "..", "uploads")
fs.mkdirSync(pastaUploads, { recursive: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, pastaUploads),
    filename: (req, file, cb) => {
        const nomeUnico = `${crypto.randomUUID()}${path.extname(file.originalname)}`
        cb(null, nomeUnico)
    }
})

// Só formatos raster — nunca SVG: um SVG pode embutir <script>, e como os
// uploads são servidos estaticamente no próprio domínio da API, abrir o link
// de um SVG malicioso executaria o script nesse domínio (mesma origem dos
// cookies de sessão, mesmo sendo httpOnly).
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/gif", "image/webp"]

// Classe própria em vez de comparar err.message por string — mais robusto
// no middleware de erro do server.ts, que precisa identificar esse erro sem
// deixá-lo cair no handler padrão do Express (que vaza stack trace em HTML).
export class ErroTipoArquivo extends Error {}

function filtroImagem(req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
        cb(new ErroTipoArquivo("Formato de imagem não suportado (use JPEG, PNG, GIF ou WEBP)"))
        return
    }
    cb(null, true)
}

export const upload = multer({
    storage,
    fileFilter: filtroImagem,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB por arquivo
})

export { pastaUploads }
