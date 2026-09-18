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

// Cache em memória: evita gerar o mesmo insight a cada carregamento de página
// (a API de IA tem cota limitada, e o texto não muda enquanto o imóvel não muda).
const cache = new Map<string, { expiraEm: number, valor: InsightIA }>()
const TTL_SUCESSO = 6 * 60 * 60 * 1000 // 6 horas
const TTL_FALHA = 2 * 60 * 1000 // 2 minutos (permite recuperar rápido de um erro temporário)

export async function gerarInsightImovel(imovel: ImovelParaIA): Promise<InsightIA> {
    const chave = `${imovel.titulo}|${imovel.cidade}|${imovel.endereco}|${imovel.quartos}|${imovel.preco}`
    const emCache = cache.get(chave)
    if (emCache && emCache.expiraEm > Date.now()) {
        return emCache.valor
    }

    const insight = await consultarIA(imovel)
    cache.set(chave, {
        expiraEm: Date.now() + (insight.disponivel ? TTL_SUCESSO : TTL_FALHA),
        valor: insight
    })
    return insight
}

async function consultarIA(imovel: ImovelParaIA): Promise<InsightIA> {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
        return {
            disponivel: false,
            fonte: "IA",
            motivo: "GEMINI_API_KEY não configurada"
        }
    }

    const prompt = `Você descreve bairros para um site de aluguel de imóveis.
Em até 3 frases curtas, comente sobre a região "${imovel.cidade}" (endereço de referência: "${imovel.endereco}")
pensando em quem vai morar num imóvel de ${imovel.quartos} quarto(s) por R$ ${imovel.preco}/mês, título do anúncio: "${imovel.titulo}".
Não invente números exatos de distância ou estatísticas oficiais; fale em termos gerais (perfil da região, o que costuma ter por perto).
Responda só com o texto, sem introdução.`

    try {
        const controle = new AbortController()
        const timeout = setTimeout(() => controle.abort(), 12000)

        const resposta = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "content-type": "application/json" },
                signal: controle.signal,
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    // Desliga o "thinking" do Gemini 2.5 — sem isso, a resposta
                    // pode demorar dezenas de segundos, inviável pra um banner de home.
                    generationConfig: { thinkingConfig: { thinkingBudget: 0 } }
                })
            }
        )
        clearTimeout(timeout)

        if (!resposta.ok) {
            return {
                disponivel: false,
                fonte: "IA",
                motivo: `Falha na consulta à IA (status ${resposta.status})`
            }
        }

        const dados = await resposta.json() as {
            candidates?: { content?: { parts?: { text?: string }[] } }[]
        }
        const texto = dados.candidates?.[0]?.content?.parts?.[0]?.text

        if (!texto) {
            return { disponivel: false, fonte: "IA", motivo: "IA não retornou texto" }
        }

        return { disponivel: true, fonte: "IA", texto: texto.trim() }
    } catch (error) {
        const motivo = error instanceof Error && error.name === "AbortError"
            ? "IA demorou demais para responder"
            : "Erro ao contatar a IA"
        return { disponivel: false, fonte: "IA", motivo }
    }
}
