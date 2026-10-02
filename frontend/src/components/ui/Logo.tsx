type LogoProps = {
    className?: string
}

export function Logo({ className = "" }: LogoProps) {
    return (
        <span className={`inline-flex items-center gap-2.5 text-white ${className}`}>
            <span className="w-8 h-8 shrink-0 rounded-lg bg-accent-400 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6 19V5L18 19V5"
                        stroke="#121212" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"
                    />
                </svg>
            </span>
            <span className="font-display font-bold text-2xl tracking-tight">
                Ninho
            </span>
        </span>
    )
}
