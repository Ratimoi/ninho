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

interface DadosAnuncio {
    titulo: string
    cidade: string
    endereco: string
    quartos: number
}

export interface SugestaoAnuncio {
    disponivel: boolean
    fonte: "IA"
    descricao?: string
    precoSugerido?: number
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

// Requisito extra: ao anunciar um imóvel, gerar descrição + sugestão de preço
// a partir dos demais campos preenchidos (título, cidade, endereço, quartos).
// Sem cache aqui — é uma ação pontual disparada pelo usuário, não recarregada
// a toda visita de página.
export async function gerarSugestaoAnuncio(dados: DadosAnuncio): Promise<SugestaoAnuncio> {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
        return { disponivel: false, fonte: "IA", motivo: "GEMINI_API_KEY não configurada" }
    }

    const prompt = `Você ajuda proprietários a anunciar imóveis para aluguel no Brasil.
Dados do imóvel: título "${dados.titulo}", cidade "${dados.cidade}", endereço "${dados.endereco}", ${dados.quartos} quarto(s).
Gere:
1. Uma descrição atrativa de anúncio (2 a 4 frases, tom convidativo, sem inventar comodidades que não foram informadas).
2. Uma sugestão de valor de aluguel mensal em reais, plausível para o perfil informado (seja realista; sem inventar fontes ou estatísticas oficiais).
Responda SOMENTE em JSON, no formato exato: {"descricao": "...", "precoSugerido": 1800}
precoSugerido deve ser um número inteiro, sem formatação.`

    try {
        const controle = new AbortController()
        const timeout = setTimeout(() => controle.abort(), 15000)

        const resposta = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "content-type": "application/json" },
                signal: controle.signal,
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        thinkingConfig: { thinkingBudget: 0 },
                        responseMimeType: "application/json"
                    }
                })
            }
        )
        clearTimeout(timeout)

        if (!resposta.ok) {
            return { disponivel: false, fonte: "IA", motivo: `Falha na consulta à IA (status ${resposta.status})` }
        }

        const dadosResposta = await resposta.json() as {
            candidates?: { content?: { parts?: { text?: string }[] } }[]
        }
        const texto = dadosResposta.candidates?.[0]?.content?.parts?.[0]?.text

        if (!texto) {
            return { disponivel: false, fonte: "IA", motivo: "IA não retornou conteúdo" }
        }

        const json = JSON.parse(texto) as { descricao?: string, precoSugerido?: number }
        if (!json.descricao || typeof json.precoSugerido !== "number") {
            return { disponivel: false, fonte: "IA", motivo: "IA retornou formato inesperado" }
        }

        return { disponivel: true, fonte: "IA", descricao: json.descricao.trim(), precoSugerido: Math.round(json.precoSugerido) }
    } catch (error) {
        const motivo = error instanceof Error && error.name === "AbortError"
            ? "IA demorou demais para responder"
            : "Erro ao contatar a IA"
        return { disponivel: false, fonte: "IA", motivo }
    }
}
