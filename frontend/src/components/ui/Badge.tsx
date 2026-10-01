type BadgeProps = {
    children: React.ReactNode
    tone?: "brand" | "accent" | "amber" | "red" | "gray"
}

const tons = {
    brand: "bg-brand-100 text-brand-800",
    accent: "bg-accent-100 text-accent-700",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600"
}

export function Badge({ children, tone = "gray" }: BadgeProps) {
    return (
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${tons[tone]}`}>
            {children}
        </span>
    )
}
