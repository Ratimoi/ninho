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

function filtroImagem(req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    if (!file.mimetype.startsWith("image/")) {
        cb(new Error("Somente arquivos de imagem são permitidos"))
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
