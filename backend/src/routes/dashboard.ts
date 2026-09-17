import { Router } from "express"
import { prisma } from "../../lib/prisma"
import { autenticarAdmin } from "../../lib/auth"

const router = Router()

router.get("/", autenticarAdmin, async (req, res) => {
    try {
        const [totalImoveis, totalUsuarios, totalReservas, reservasPorStatus, notas] = await Promise.all([
            prisma.imovel.count(),
            prisma.usuario.count(),
            prisma.reserva.count(),
            prisma.reserva.groupBy({ by: ["status"], _count: { _all: true } }),
            prisma.reserva.findMany({ where: { NOT: { nota: null } }, select: { nota: true } })
        ])

        const mediaNotas = notas.length > 0
            ? Number((notas.reduce((soma, r) => soma + (r.nota ?? 0), 0) / notas.length).toFixed(1))
            : null

        const cidades = await prisma.imovel.groupBy({ by: ["cidade"], _count: { _all: true } })

        res.status(200).json({
            totalImoveis,
            totalUsuarios,
            totalReservas,
            mediaNotas,
            reservasPorStatus: reservasPorStatus.map(r => ({ status: r.status, total: r._count._all })),
            imoveisPorCidade: cidades.map(c => ({ cidade: c.cidade, total: c._count._all }))
        })
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

export default router
