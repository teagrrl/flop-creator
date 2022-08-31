/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react"
import { PokemonModel, sortLabels, SortType, StatComparator } from "@data/pokemon"
import { hexToRGBA, possessive, properName } from "@helpers/utilities"
import { PlayerData } from "@components/settings"
import { PokemonPoolStats } from "@components/pickban"
import PokemonStatRow from "@components/pokemonstatrow"

type PokemonStats = {
    hp: number,
    attack: number,
    defense: number,
    specialAttack: number,
    specialDefense: number,
    speed: number,
    total: number,
}

type PokemonCompareProps = {
    teams: PokemonModel[][],
    min?: PokemonStats,
    max?: PokemonStats,
    stats?: PokemonPoolStats,
    players: PlayerData[],
    onClose?: Function,
}

export default function PokemonCompare({ teams, min, max, stats, players, onClose }: PokemonCompareProps) {
    const [sort, setSort] = useState<SortType>("speed")

    teams = teams.map((team) => team.sort(StatComparator(sort)))

    function handleClose() {
        if(onClose) {
            onClose()
        }
    }

    function updateSort(type: SortType) {
        setSort(type)
    }

    return (
        <div className="overflow-auto bg-neutral-900">
            <div className="flex flex-col">
                {players.map((player, num) => 
                    <div key={`player_${num}`} className="flex flex-col">
                        <div className="relative flex flex-row px-4 py-2 items-center" style={{ backgroundColor: player.color }}>
                            <span className="flex-grow text-center text-xl font-bold">{possessive(player.name)} Team</span>
                            <div className="absolute right-2 flex flex-row gap-1 text-xs">{sortLabels.map((sort) => 
                                <button key={`player_${num}_${sort.label}`} className="px-2 py-1 rounded-md bg-neutral-600/50 hover:bg-neutral-500/50" onClick={() => updateSort(sort.type)}>{sort.label}</button>
                            )}</div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {teams[num].map((model, index) => 
                                <div key={model.name} className="flex flex-col gap-2 px-4 py-2" style={{ backgroundColor: hexToRGBA(player.color, (Math.floor(index / 3) + 2) % 3 ? 0.1 : 0.2) }}>
                                    <div className="flex flex-row flex-grow gap-2 items-center">
                                        <div className="flex flex-col flex-grow justify-center items-center">
                                            <div className="relative h-12 w-12">
                                                <img src={model.sprite ?? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"} alt={model.name} width="100%" height="100%" />
                                                {model.isShiny && <span className="absolute top-0 left-0">🌟</span>}
                                            </div>
                                            <div className="text-lg text-center font-bold">{properName(model.name)}</div>
                                            <div className="flex flex-row justify-center items-center gap-0.5 text-xs">
                                                {model.types.map((type) => 
                                                    <div key={`${model.name}_${type}`} className={`px-1.5 py-0.5 pkmn-detail bg-${type}`}>
                                                        <span>{properName(type)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col text-xs">
                                            <PokemonStatRow label={"BST"} current={model.baseStatTotal} min={min?.total} max={max?.total} stats={stats?.total} />
                                            <PokemonStatRow label={"HP"} current={model.stats.hp} min={min?.hp} max={max?.hp} stats={stats?.hp} />
                                            <PokemonStatRow label={"Atk"} current={model.stats.attack} min={min?.attack} max={max?.attack} stats={stats?.attack} />
                                            <PokemonStatRow label={"Def"} current={model.stats.defense} min={min?.defense} max={max?.defense} stats={stats?.defense} />
                                            <PokemonStatRow label={"SpAtk"} current={model.stats.specialAttack} min={min?.specialAttack} max={max?.specialAttack} stats={stats?.specialAttack} />
                                            <PokemonStatRow label={"SpDef"} current={model.stats.specialDefense} min={min?.specialDefense} max={max?.specialDefense} stats={stats?.specialDefense} />
                                            <PokemonStatRow label={"Spe"} current={model.stats.speed} min={min?.speed} max={max?.speed} stats={stats?.speed} />
                                        </div>
                                    </div>
                                    <div className="flex flex-row flex-wrap justify-center items-center gap-0.5 text-xs">
                                        <span className="mr-1">{model.abilities.length > 1 ? "Abilities" : "Ability"}</span>
                                        {model.abilities.map((ability) => 
                                            <div key={`${model.name}_${ability}`} className={`px-1 pkmn-detail bg-white text-black`}>
                                                <span>{properName(ability)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <button className="w-full px-4 py-2 text-lg font-semibold bg-neutral-700 hover:bg-neutral-600" onClick={handleClose}>Close</button>
        </div>
    )
}