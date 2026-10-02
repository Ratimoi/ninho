import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import type { DashboardType } from "../../utils/types"
import { Card } from "../../components/ui/Card"

const apiUrl = import.meta.env.VITE_API_URL
const CORES = ["#c8ff4d", "#121212", "#a8e62e", "#6b6b66", "#2a2a2a"]

function CardResumo({ titulo, valor }: { titulo: string, valor: string | number }) {
    return (
        <Card>
            <p className="text-sm text-ink-400">{titulo}</p>
            <p className="text-3xl font-display font-bold text-ink-900">{valor}</p>
        </Card>
    )
}

export default function Dashboard() {
    const [dados, setDados] = useState<DashboardType>()

    useEffect(() => {
        async function buscar() {
            const response = await fetch(`${apiUrl}/dashboard`, {
                credentials: "include"
            })
            setDados(await response.json())
        }
        buscar()
    }, [])

    if (!dados) return <p className="text-ink-400">Carregando...</p>

    return (
        <div>
            <h1 className="text-2xl font-display font-bold text-ink-900 mb-4 tracking-tight">Visão geral do sistema</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <CardResumo titulo="Imóveis" valor={dados.totalImoveis} />
                <CardResumo titulo="Usuários" valor={dados.totalUsuarios} />
                <CardResumo titulo="Reservas" valor={dados.totalReservas} />
                <CardResumo titulo="Nota média" valor={dados.mediaNotas ?? "—"} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h2 className="font-display font-semibold text-ink-900 mb-3">Reservas por status</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={dados.reservasPorStatus} dataKey="total" nameKey="status" outerRadius={90} label>
                                {dados.reservasPorStatus.map((_, i) => (
                                    <Cell key={i} fill={CORES[i % CORES.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card>
                    <h2 className="font-display font-semibold text-ink-900 mb-3">Imóveis por cidade</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dados.imoveisPorCidade}>
                            <XAxis dataKey="cidade" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="total" fill="#c8ff4d" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    )
}
