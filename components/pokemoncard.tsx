/* eslint-disable @next/next/no-img-element */
import React from "react"
import { PokemonModel } from "@data/pokemon"
import { hexToRGBA, properName } from "@helpers/utilities"

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
                <img className="max-h-[80%]" src={model.artwork ?? model.sprite ?? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"} alt={properName(model.name)} width="100%" height="100%" />
                <div className="text-lg font-semibold text-center">{name ?? model.name}</div>
                <div className="absolute top-0 right-0 flex flex-row flex-wrap justify-end gap-0.5 text-xs">
                    {model.types.map((type) => 
                        <div key={`${model.name}_${type}`} className={`h-fit px-2 py-0.5 pkmn-detail bg-${type} text-center`}>
                            <span>{properName(type)}</span>
                        </div>
                    )}
                    <div className="flex flex-col gap-0.5">
                        {model.badges.map((badge) => 
                            <div key={`${model.name}_${badge}`} className="p-0.5 pkmn-detail bg-white/40" title={getBadgeMeaning(badge)}>
                                <span>{getBadgeIcon(badge)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </button>
    )
}

function getBadgeMeaning(badge: string) {
    switch(badge) {
        case "def3":
            return "Physically Bulky"
        case "def4":
            return "Physical Wall"
        case "def5":
            return "Physically Unkillable"
        case "spdef3":
            return "Specially Bulky"
        case "spdef4":
            return "Special Wall"
        case "spdef5":
            return "Specially Unkillable"
        case "hazards":
            return "Can set hazards"
        case "spinner":
            return "Can remove hazards"
        default:
            return badge
    }
}

function getBadgeIcon(badge: string) {
    switch(badge) {
        case "def3":
        case "def4":
        case "def5":
            return "🛡️"
        case "spdef3":
        case "spdef4":
        case "spdef5":
            return "🦺"
        case "hazards":
            return "⚠️"
        case "spinner":
            return "🌀"
        default:
            return "❓"
    }
}