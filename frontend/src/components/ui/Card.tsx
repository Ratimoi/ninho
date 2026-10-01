type CardProps = {
    children: React.ReactNode
    className?: string
}

export function Card({ children, className = "" }: CardProps) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-cream-200 p-5 ${className}`}>
            {children}
        </div>
    )
}
