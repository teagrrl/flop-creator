import { autoUpdate, flip, FloatingPortal, offset as MiddlewareOffset, Placement, shift, useFloating, useFocus, useHover, useInteractions, useRole } from "@floating-ui/react"
import React, { ReactNode, useState } from "react"
import { twMerge } from "tailwind-merge"


type TooltipProps = {
	children: ReactNode
	className?: string
	position?: Placement,
	offset?: number,
	tooltip: ReactNode
}

export default function Tooltip({ children, className, offset, position, tooltip }: TooltipProps) {
	const [isOpen, setIsOpen] = useState<boolean>(false)
	
	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: position || "top",
		// Make sure the tooltip stays on the screen
		whileElementsMounted: autoUpdate,
		middleware: [
			MiddlewareOffset(offset),
			flip({ fallbackAxisSideDirection: "start" }),
			shift(),
		]
	})
	
	const hover = useHover(context, { move: false })
	const focus = useFocus(context)
	const role = useRole(context, { role: "tooltip" })

	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
		focus,
		role,
	])

	return (
		<>
			<div ref={refs.setReference} className={twMerge(["relative", className])} {...getReferenceProps()}>
				{children}
			</div>
			<FloatingPortal>
				{isOpen && (
					<div ref={refs.setFloating} className="z-40" style={floatingStyles} {...getFloatingProps()}>
						{tooltip}
					</div>
				)}
			</FloatingPortal>
		</>
	)
}