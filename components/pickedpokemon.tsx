/* eslint-disable @next/next/no-img-element */
import React from "react"
import { PokemonModel } from "@data/pokemon";
import { hexToRGBA } from "@helpers/utilities";

type PickedPokemonProps = {
    model?: PokemonModel,
    color: string,
}

export default function PickedPokemon({ model, color }: PickedPokemonProps) {
    return (
        <div className="border-[1px] border-neutral-900 bg-neutral-900 -skew-x-[20deg] overflow-hidden" style={{ backgroundColor: hexToRGBA(color, 0.8) }}>
            <div className="relative w-12 h-12 skew-x-[20deg]">
                {model && <img src={model.artwork ?? model.sprite ?? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"} alt={model.name} />}
            </div>
        </div>
    )
}