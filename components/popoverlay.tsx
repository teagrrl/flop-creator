import React, { ReactNode } from "react"

type PopOverlayProps = {
    children: ReactNode,
    width: string | number,
    height: string | number,
}

export default function PopOverlay({ children, width, height }: PopOverlayProps) {
    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden bg-neutral-600/50">
            <div style={{ maxHeight: height, maxWidth: width }} className="absolute top-1/2 left-1/2 w-full shadow-lg -translate-x-1/2 -translate-y-1/2 overflow-auto">
                {children}
            </div>
        </div>
    )
}