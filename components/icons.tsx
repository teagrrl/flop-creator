import React from "react"

type IconProps = {
	className: string
}

export function PokeballIcon({ className }: IconProps) {
	return (
		<Icon className={className}>
			<path d="M10.1,2.8c3.8,0,6.9,2.9,7.2,6.6H12.8c-0.3-1.3-1.4-2.2-2.8-2.2c-1.4,0-2.5,1-2.8,2.2H2.8C3.1,5.7,6.3,2.8,10.1,2.8z M11.6,9.4c0.1,0.2,0.1,0.4,0.1,0.6c0,0,0,0,0,0h0c0,0,0,0,0,0c0,0.2-0,0.4-0.1,0.6c-0.2,0.6-0.8,1.1-1.6,1.1c-0.7,0-1.3-0.5-1.6-1.1c-0.1-0.2-0.1-0.4-0.1-0.6c0,0,0,0,0,0h-0c0,0,0,0,0,0c0-0.2,0-0.4,0.1-0.6c0.2-0.6,0.8-1.1,1.6-1.1S11.3,8.8,11.6,9.4z M10,17.2c-3.8,0-6.9-2.9-7.2-6.6h4.5c0.3,1.3,1.4,2.2,2.8,2.2s2.5-1,2.8-2.2h4.4C16.9,14.3,13.8,17.2,10,17.2z M10,1.4C5.3,1.4,1.4,5.2,1.4,10s3.8,8.6,8.6,8.6S18.6,14.7,18.6,10S14.8,1.4,10,1.4z"
			/>
		</Icon>
	)
}

type IconBaseProps = {
	children: React.ReactNode
	className: string
}

function Icon({ children, className }: IconBaseProps) {
	return (
		<span className={className}>
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="currentColor"
				xmlns="http://www.w3.org/2000/svg"
			>
				{children}
			</svg>
		</span>
	)
}