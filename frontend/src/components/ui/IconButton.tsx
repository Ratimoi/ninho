import type { ButtonHTMLAttributes, ReactNode } from "react"

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: "ghost" | "danger"
    "aria-label": string
    children: ReactNode
}

const tons = {
    ghost: "bg-ink-900/5 text-ink-700 hover:bg-ink-900/10",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
}

export function IconButton({ tone = "ghost", className = "", children, ...props }: IconButtonProps) {
    return (
        <button
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${tons[tone]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}
