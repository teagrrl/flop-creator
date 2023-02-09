/* eslint-disable @next/next/no-img-element */
import React from "react"
import { PokemonModel } from "@data/pokemon"
import { hexToRGBA, properName } from "@helpers/utilities"

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
                ? <button className="border-[1px] border-neutral-900 bg-neutral-900 -skew-x-[20deg] overflow-hidden" style={{ backgroundColor: hexToRGBA(color, 0.7) }} onClick={handleClick}>
                    <div className="flex relative w-10 h-11 items-center justify-center skew-x-[20deg]">
                        <img className="w-10 h-10 scale-125" src={model.artwork ?? model.sprite ?? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"} alt={properName(model.name)} />
                    </div>
                </button>
                : <div className="w-10 h-[46px] border-[1px] border-neutral-900 bg-neutral-900 -skew-x-[20deg]" style={{ backgroundColor: hexToRGBA(color, 0.8) }}></div>
            }
        </>
    )
}