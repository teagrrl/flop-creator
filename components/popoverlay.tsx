import React, { ReactNode } from "react"

type PopOverlayProps = {
    children: ReactNode,
    className: string,
}

export default function PopOverlay({ children, className }: PopOverlayProps) {
    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden bg-neutral-600/50 z-30">
            <div className={`absolute top-1/2 left-1/2 shadow-lg -translate-x-1/2 -translate-y-1/2 overflow-auto ${className}`}>
                {children}
            </div>
        </div>
    )
}