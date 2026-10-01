import "dotenv/config"
import { Resend } from "resend"

interface RespostaParaEmail {
    destinatarioEmail: string
    destinatarioNome: string
    imovelTitulo: string
    resposta: string
}

interface RecuperacaoSenhaParaEmail {
    destinatarioEmail: string
    destinatarioNome: string
    link: string
}

export interface ResultadoEmail {
    enviado: boolean
    motivo?: string
}

// Nome, título do imóvel e resposta vêm de dados informados por usuários —
// sem escapar, um valor tipo "<img onerror=...>" no título de um imóvel ou no
// nome de alguém iria direto pro HTML do e-mail enviado a terceiros.
function escaparHtml(texto: string) {
    return texto
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;")
}

export async function enviarEmailResposta(dados: RespostaParaEmail): Promise<ResultadoEmail> {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
        return { enviado: false, motivo: "RESEND_API_KEY não configurada" }
    }

    const resend = new Resend(apiKey)

    try {
        const { error } = await resend.emails.send({
            from: "Ninho <onboarding@resend.dev>",
            to: [dados.destinatarioEmail],
            subject: `Resposta sobre "${dados.imovelTitulo}"`,
            html: `
                <p>Olá, ${escaparHtml(dados.destinatarioNome)}!</p>
                <p>Você recebeu uma resposta sobre o imóvel <strong>${escaparHtml(dados.imovelTitulo)}</strong>:</p>
                <blockquote style="border-left: 3px solid #059669; margin: 0; padding-left: 12px; color: #374151;">
                    ${escaparHtml(dados.resposta)}
                </blockquote>
                <p style="color: #6b7280; font-size: 13px;">Acesse o Ninho para ver mais detalhes.</p>
            `
        })

        if (error) {
            return { enviado: false, motivo: error.message }
        }

        return { enviado: true }
    } catch (error) {
        return { enviado: false, motivo: "Erro ao contatar o serviço de e-mail" }
    }
}

export async function enviarEmailRecuperacaoSenha(dados: RecuperacaoSenhaParaEmail): Promise<ResultadoEmail> {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
        return { enviado: false, motivo: "RESEND_API_KEY não configurada" }
    }

    const resend = new Resend(apiKey)

    try {
        const { error } = await resend.emails.send({
            from: "Ninho <onboarding@resend.dev>",
            to: [dados.destinatarioEmail],
            subject: "Recuperação de senha — Ninho",
            html: `
                <p>Olá, ${escaparHtml(dados.destinatarioNome)}!</p>
                <p>Recebemos um pedido para redefinir a senha da sua conta no Ninho. Clique no link abaixo para escolher uma nova senha:</p>
                <p><a href="${dados.link}" style="color: #3c6530; font-weight: 600;">Redefinir minha senha</a></p>
                <p style="color: #6b7280; font-size: 13px;">O link expira em 30 minutos. Se você não pediu essa recuperação, pode ignorar este e-mail.</p>
            `
        })

        if (error) {
            return { enviado: false, motivo: error.message }
        }

        return { enviado: true }
    } catch (error) {
        return { enviado: false, motivo: "Erro ao contatar o serviço de e-mail" }
    }
}
