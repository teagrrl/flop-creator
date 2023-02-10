import React from "react"
import { properName } from "@helpers/utilities"

type PokemonTypeProps = {
    type: string,
}

export default function PokemonType({ type }: PokemonTypeProps) {
    return (
        <div className={`h-fit px-2 py-0.5 pkmn-detail bg-${type} text-center`}>
            <span>{properName(type)}</span>
        </div>
    )
}