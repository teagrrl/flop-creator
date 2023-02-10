/* eslint-disable @next/next/no-img-element */
import React from "react"
import { PokemonModel } from "@data/pokemon"
import { properName } from "@helpers/utilities"
import { PokemonPoolStats } from "@components/pickban"
import PokemonStatRow from "@components/pokemonstatrow"
import StatsRadar from "@components/statsradar"
import PokemonType from "@components/pokemontype"

type PokemonStats = {
    hp: number,
    attack: number,
    defense: number,
    specialAttack: number,
    specialDefense: number,
    speed: number,
    total: number,
}

type PokemonDetailsProps = {
    model: PokemonModel,
    min?: PokemonStats,
    max?: PokemonStats,
    stats?: PokemonPoolStats,
}

export default function PokemonDetails({ model, min, max, stats }: PokemonDetailsProps) {

    return (
        <div className="max-h-[210px] flex flex-row gap-2 p-2">
            <div className="min-w-[250px] flex flex-col gap-2 items-center justify-center">
                <div className="w-full flex flex-row items-center gap-2 overflow-hidden">
                    <div className="relative">
                        <img src={model.sprite ?? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"} alt={properName(model.name)} width="100%" height="100%" />
                        {model.isShiny && <span className="absolute top-0 left-0">🌟</span>}
                    </div>
                    <div className="flex flex-col flex-grow gap-1">
                        <h1 className="text-2xl font-bold text-center">{properName(model.name)}</h1>
                        <div className="flex flex-row justify-center items-center gap-1 text-sm">
                            {model.types.map((type) => <PokemonType key={`${model.name}_${type}`} type={type} />)}
                        </div>
                    </div>
                </div>
                <div className="flex flex-row flex-wrap justify-center items-center gap-1 text-sm">
                    <div className="mr-2">{model.abilities.length > 1 ? "Abilities" : "Ability"}</div>
                    {model.abilities.map((ability) => 
                        <div key={`${model.name}_${ability}`} className="px-2 py-0.5 pkmn-detail text-black bg-white">
                            <span>{properName(ability)}</span>
                        </div>
                    )}
                </div>
                <div className="flex-grow"></div>
            </div>
            <div className="min-w-[240px] flex flex-col gap-0.5 justify-center">
                <PokemonStatRow label={"Base Stat Total"} current={model.baseStatTotal} min={min?.total} max={max?.total} stats={stats?.total} />
                <PokemonStatRow label={"HP"} current={model.stats.hp} min={min?.hp} max={max?.hp} stats={stats?.hp} />
                <PokemonStatRow label={"Attack"} current={model.stats.attack} min={min?.attack} max={max?.attack} stats={stats?.attack} />
                <PokemonStatRow label={"Defense"} current={model.stats.defense} min={min?.defense} max={max?.defense} stats={stats?.defense} />
                <PokemonStatRow label={"Special Attack"} current={model.stats.specialAttack} min={min?.specialAttack} max={max?.specialAttack} stats={stats?.specialAttack} />
                <PokemonStatRow label={"Special Defense"} current={model.stats.specialDefense} min={min?.specialDefense} max={max?.specialDefense} stats={stats?.specialDefense} />
                <PokemonStatRow label={"Speed"} current={model.stats.speed} min={min?.speed} max={max?.speed} stats={stats?.speed} />
            </div>
            <div className="flex flex-col items-center justify-center">
                <StatsRadar stats={model.stats} pool={stats} />
            </div>
            <div className="flex overflow-auto text-xs">
                <div className="flex flex-row flex-wrap justify-evenly items-center gap-1 px-1">
                    <div className="mr-2">Moveset</div>
                    {model.moves.map((move) => 
                        <div key={`${model.name}_${move}`} className="flex-grow px-1 pkmn-detail text-center text-black bg-neutral-100 even:bg-slate-200">
                            <span>{properName(move)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}