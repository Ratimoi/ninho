type CardProps = {
    children: React.ReactNode
    className?: string
}

export function Card({ children, className = "" }: CardProps) {
    return (
        <div className={`bg-white rounded-xl shadow-lg shadow-ink-900/5 p-5 ${className}`}>
            {children}
        </div>
    )
}
