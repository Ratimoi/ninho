import type { ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "accent" | "outline" | "danger" | "ghost"
}

const variantes = {
    primary: "bg-brand-700 text-white hover:bg-brand-800",
    accent: "bg-accent-500 text-white hover:bg-accent-600",
    outline: "border border-brand-700 text-brand-700 bg-transparent hover:bg-brand-50",
    danger: "text-red-600 hover:underline bg-transparent px-0 py-0 font-normal",
    ghost: "text-gray-600 hover:bg-gray-100 bg-transparent"
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
    const base = variant === "danger"
        ? ""
        : "px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

    return (
        <button
            className={`${base} ${variantes[variant]} ${className}`}
            {...props}
        />
    )
}
