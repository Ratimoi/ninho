type BadgeProps = {
    children: React.ReactNode
    tone?: "brand" | "accent" | "amber" | "red" | "gray"
}

const tons = {
    brand: "bg-ink-900 text-white",
    accent: "bg-accent-100 text-accent-600",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
    gray: "bg-line-100 text-ink-400"
}

export function Badge({ children, tone = "gray" }: BadgeProps) {
    return (
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${tons[tone]}`}>
            {children}
        </span>
    )
}
