import type { ButtonHTMLAttributes, ReactNode } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "outline" | "danger" | "ghost"
    icon?: ReactNode
    loading?: boolean
}

const variantes = {
    primary: "bg-accent-400 text-ink-900 hover:bg-accent-500",
    outline: "border border-ink-700 text-ink-900 bg-transparent hover:bg-ink-900/5",
    danger: "text-red-600 hover:underline bg-transparent px-0 py-0 font-normal",
    ghost: "text-ink-400 hover:bg-ink-900/5 bg-transparent"
}

function Spinner() {
    return (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    )
}

export function Button({ variant = "primary", icon, loading = false, disabled, className = "", children, ...props }: ButtonProps) {
    const base = variant === "danger"
        ? ""
        : "px-4 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

    return (
        <button
            className={`${base} ${variantes[variant]} inline-flex items-center justify-center gap-2 ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <Spinner /> : icon}
            {children}
        </button>
    )
}
