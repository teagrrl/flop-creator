/* eslint-disable @next/next/no-img-element */
import React from "react"
import { PokemonModel } from "@data/pokemon"
import { hexToRGBA, properName } from "@helpers/utilities"
import PokemonType from "@components/pokemontype"

type PickedPokemonProps = {
    model?: PokemonModel,
    color?: string,
    align?: "left" | "right",
    isHighlighted?: boolean,
    onClick?: (model?: PokemonModel) => void,
}

export default function PickedPokemon({ model, color, align, isHighlighted, onClick }: PickedPokemonProps) {
    let alignClass: string
    let typesClass: string
    switch(align) {
        case "left":
            alignClass = "left-2"
            typesClass = "right-0"
            break
        case "right":
            alignClass = "right-2"
            typesClass = "left-0"
            break
        default:
            alignClass = ""
            typesClass = ""
    }

    function handleClick() {
        if(onClick) {
            onClick(model)
        }
    }

    return (
        <>
            {model 
                ? <button className="relative flex-grow-[2] bg-neutral-900/80" style={{ backgroundColor: hexToRGBA(color, 0.7) }} onClick={handleClick}>
                    <div className="flex relative h-full w-full items-center justify-center overflow-hidden">
                        <img className="absolute top-0 scale-125 preview-anim" src={model.artwork ?? model.sprite ?? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"} alt={properName(model.name)} />
                        {align !== undefined && <div className={`absolute ${alignClass} bottom-1 text-lg font-semibold`} style={{ textShadow: "#000000 2px 2px 2px" }}>{model.species}</div>}
                    </div>
                    <div className={`absolute -top-1 ${typesClass} flex flex-row flex-wrap justify-end gap-1 text-sm`}>
                        {model.types.map((type) => <PokemonType key={`${model.name}_${type}`} type={type} />)}
                    </div>
                </button>
                : <div className={`flex-grow ${isHighlighted && "next-pick-anim"}`} style={{ backgroundColor: hexToRGBA(color, isHighlighted ? 0.4 : 0.8) }}></div>
            }
        </>
    )
}