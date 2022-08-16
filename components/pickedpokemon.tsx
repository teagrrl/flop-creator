/* eslint-disable @next/next/no-img-element */
import React from "react"
import { PokemonModel } from "@data/pokemon";
import { hexToRGBA } from "@helpers/utilities";

type PickedPokemonProps = {
    model?: PokemonModel,
    color: string,
    onClick?: Function,
}

export default function PickedPokemon({ model, color, onClick }: PickedPokemonProps) {

    function handleClick() {
        if(onClick) {
            onClick(model)
        }
    }

    return (
        <>
            {model 
                ? <button className="border-[1px] border-neutral-900 bg-neutral-900 -skew-x-[20deg] overflow-hidden" style={{ backgroundColor: hexToRGBA(color, 0.8) }} onClick={handleClick}>
                    <div className="relative w-12 h-12 skew-x-[20deg]">
                        <img src={model.artwork ?? model.sprite ?? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"} alt={model.name} />
                    </div>
                </button>
                : <div className="w-12 h-12 border-[1px] border-neutral-900 bg-neutral-900 -skew-x-[20deg]" style={{ backgroundColor: hexToRGBA(color, 0.8) }}></div>
            }
        </>
    )
}