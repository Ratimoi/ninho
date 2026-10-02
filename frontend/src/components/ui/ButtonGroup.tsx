import type { ReactNode } from "react"

export function ButtonGroup({ children, className = "" }: { children: ReactNode, className?: string }) {
    return (
        <div className={`inline-flex rounded-xl border border-line-200 overflow-hidden divide-x divide-line-200 [&>button]:rounded-none ${className}`}>
            {children}
        </div>
    )
}
