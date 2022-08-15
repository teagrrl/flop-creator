import React from "react"

type PokemonStatRowProps = {
    label?: string,
    current: number,
    min?: number,
    max?: number,
    stats?: number[],
    hideValue?: boolean,
}

export default function PokemonStatRow({ label, current, min, max, stats, hideValue }: PokemonStatRowProps) {
    const percentileIndex = stats ? stats.findIndex((val) => val === current) : -1
    const percentile = stats ? (stats.length - percentileIndex) / stats.length : -1
    const ratio = percentile > 0 ? percentile : max ? (current - (min ?? 0)) / (max - (min ?? 0)) : undefined
    const colorClass = ratio !== undefined
        ? ratio > 0.9 
            ? "bg-emerald-700" 
            : ratio > 0.7 
                ? "bg-lime-700" 
                : ratio > 0.5 
                    ? "bg-yellow-700" 
                    : ratio > 0.3 
                        ? "bg-amber-700" 
                        : ratio > 0.1 
                            ? "bg-orange-700" 
                            : "bg-red-700" 
        : "bg-neutral-600"
    return (
        <div className="flex flex-row gap-2">
            {label 
                ? <span className="flex-grow font-semibold">{label}</span>
                : <span className="h-2"></span>
            }
            <div className="relative w-28 text-right">
                {!hideValue && <span className="relative z-10">{current}</span>}
                {(stats || min && max) && <div className="absolute right-0 bottom-0 w-full flex justify-end h-2 bg-neutral-700">
                    <div className={colorClass} style={{ width: ratio ? `${ratio * 7}rem` : "1px" }}></div>
                </div>}
            </div>
        </div>
    )
}