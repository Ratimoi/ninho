import { Response } from "express"

interface OpcoesErroPrisma {
    // Mensagem específica para violação de chave estrangeira (P2003) —
    // ex: "Não é possível excluir um imóvel que já tem reservas".
    emUso?: string
}

// Prisma expõe o erro original (nomes de tabela, constraint, driver) no objeto
// de erro — não deve ir direto pra resposta da API. Mapeia os códigos comuns
// pra mensagens limpas e status HTTP corretos.
export function tratarErroPrisma(error: unknown, res: Response, opcoes: OpcoesErroPrisma = {}) {
    const codigo = (error as { code?: string } | null)?.code

    if (codigo === "P2025") {
        res.status(404).json({ erro: "Registro não encontrado" })
        return
    }

    if (codigo === "P2002") {
        res.status(409).json({ erro: "Já existe um registro com esse valor único" })
        return
    }

    if (codigo === "P2003") {
        res.status(409).json({ erro: opcoes.emUso ?? "Não é possível concluir: existem outros dados vinculados a este registro" })
        return
    }

    res.status(400).json({ erro: "Não foi possível completar a operação" })
}
