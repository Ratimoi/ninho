type LogoProps = {
    className?: string
    corTexto?: string
}

export function Logo({ className = "", corTexto = "text-white" }: LogoProps) {
    return (
        <span className={`inline-flex items-center gap-2 ${corTexto} ${className}`}>
            <svg viewBox="0 0 40 40" className="w-8 h-8 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M6 24C6 24 10 30 20 30C30 30 34 24 34 24"
                    stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
                />
                <path
                    d="M9 19C9 19 13 23.5 20 23.5C27 23.5 31 19 31 19"
                    stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
                />
                <path
                    d="M13 14C13 14 16 17 20 17C24 17 27 14 27 14"
                    stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
                />
                <circle cx="20" cy="11" r="3.5" fill="currentColor" />
            </svg>
            <span className="font-display font-bold text-2xl tracking-tight">
                Ninho
            </span>
        </span>
    )
}
