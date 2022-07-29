import React from "react"
import Image from "next/image"
import { PokemonModel } from "@data/pokemon";
import { hexToRGBA, properName } from "@helpers/utilities";

type PokemonCardProps = {
    name?: string,
    model: PokemonModel,
    bgOverride?: string,
    onClick?: Function,
}

export default function PokemonCard({ name, model, bgOverride, onClick }: PokemonCardProps) {
    function handleClick() {
        if(onClick) {
            onClick(model)
        }
    }

    return (
        <button className={`relative w-[7vw] max-h-[25vh] flex flex-col flex-grow justify-center items-center bg-neutral-900/80 hover:bg-neutral-700/60 shadow-md`} style={{ backgroundColor: hexToRGBA(bgOverride) }} onClick={handleClick}>
            <div className="flex flex-col flex-grow items-center justify-center overflow-hidden">
                <Image src={model.artwork ?? model.sprite ?? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"} alt={model.name} layout="intrinsic" width="100%" height="100%" />
                <div className="text-lg font-semibold text-center">{properName(name ?? model.name)}</div>
                <div className="absolute top-0 right-0 flex flex-wrap justify-end gap-0.5 text-xs">
                    {model.types.map((type) => 
                        <div key={`${model.name}_${type}`} className={`px-2 py-0.5 pkmn-detail bg-${type} text-center`}>
                            <span>{properName(type)}</span>
                        </div>
                    )}
                </div>
            </div>
        </button>
    )
}