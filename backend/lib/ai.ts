import "dotenv/config"

interface ImovelParaIA {
    titulo: string
    cidade: string
    endereco: string
    quartos: number
    preco: number
}

export interface InsightIA {
    disponivel: boolean
    fonte: "IA"
    texto?: string
    motivo?: string
}

export async function gerarInsightImovel(imovel: ImovelParaIA): Promise<InsightIA> {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
        return {
            disponivel: false,
            fonte: "IA",
            motivo: "ANTHROPIC_API_KEY não configurada"
        }
    }

    const prompt = `Você descreve bairros para um site de aluguel de imóveis.
Em até 3 frases curtas, comente sobre a região "${imovel.cidade}" (endereço de referência: "${imovel.endereco}")
pensando em quem vai morar num imóvel de ${imovel.quartos} quarto(s) por R$ ${imovel.preco}/mês, título do anúncio: "${imovel.titulo}".
Não invente números exatos de distância ou estatísticas oficiais; fale em termos gerais (perfil da região, o que costuma ter por perto).
Responda só com o texto, sem introdução.`

    try {
        const resposta = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 200,
                messages: [{ role: "user", content: prompt }]
            })
        })

        if (!resposta.ok) {
            return {
                disponivel: false,
                fonte: "IA",
                motivo: `Falha na consulta à IA (status ${resposta.status})`
            }
        }

        const dados = await resposta.json() as { content: { type: string, text?: string }[] }
        const texto = dados.content.find(c => c.type === "text")?.text

        if (!texto) {
            return { disponivel: false, fonte: "IA", motivo: "IA não retornou texto" }
        }

        return { disponivel: true, fonte: "IA", texto }
    } catch (error) {
        return {
            disponivel: false,
            fonte: "IA",
            motivo: "Erro ao contatar a IA"
        }
    }
}
