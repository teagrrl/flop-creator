import React, { ReactNode, useRef, useState } from "react"
import {
	arrow as MiddlewareArrow,
	flip as MiddlewareFlip,
	offset as MiddlewareOffset,
	shift as MiddlewareShift,
	FloatingPortal,
	Placement,
	autoUpdate,
	useFloating,
	useFocus,
	useHover,
	useInteractions,
	useRole
} from "@floating-ui/react"
import { twMerge } from "tailwind-merge"


type TooltipProps = {
	children: ReactNode
	className?: string
	position?: Placement,
	offset?: number,
	tooltip: ReactNode
}

export default function Tooltip({ children, className, offset, position, tooltip }: TooltipProps) {
	const arrowRef = useRef(null)
	const [isOpen, setIsOpen] = useState<boolean>(false)
	
	const { refs, floatingStyles, context, placement, middlewareData } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: position || "top",
		// Make sure the tooltip stays on the screen
		whileElementsMounted: autoUpdate,
		middleware: [
			MiddlewareOffset(offset ?? 8),
			MiddlewareFlip(),
			MiddlewareShift({ padding: 8 }),
			MiddlewareArrow({ element: arrowRef }),
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
	
	const arrowSide = placement.split("-")[0] as "top" | "bottom" | "left" | "right"
	const arrowPlacement = { top: "bottom", right: "left", bottom: "top", left: "right", }[arrowSide]

	return (
		<>
			<div ref={refs.setReference} className={twMerge(["relative", className])} {...getReferenceProps()}>
				{children}
			</div>
			<FloatingPortal>
				{isOpen && (
					<div
						ref={refs.setFloating} 
						className="relative p-2 py-1 z-40 text-black bg-white rounded-md"
						style={floatingStyles}
						{...getFloatingProps()}
					>
						{tooltip}
						<div
							ref={arrowRef}
							className="absolute w-2 h-2 rotate-45 bg-white"
							style={{
								left: middlewareData.arrow?.x,
								top: middlewareData.arrow?.y,
								[arrowPlacement]: -4,
							}}
						/>
					</div>
				)}
			</FloatingPortal>
		</>
	)
}