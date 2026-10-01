import rateLimit from "express-rate-limit"

// Geral: protege a API contra abuso/flood sem incomodar uso normal.
export const limiteGeral = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
})

// Login e cadastro são os alvos típicos de força bruta/credential stuffing —
// limite bem mais apertado, por IP.
export const limiteAutenticacao = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }
})
