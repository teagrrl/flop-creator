/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react"
import { PokemonModel } from "@data/pokemon";
import { possessive, properName } from "@helpers/utilities";
import { PlayerData } from "@components/settings";
import { PokemonPoolStats } from "@components/pickban";
import PokemonStatRow from "@components/pokemonstatrow";

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
    banColor: string,
    players: PlayerData[],
    onBan?: Function,
    onPlayerPick?: Function,
    onUnpick?: Function,
}

type DetailTab = "stats" | "moves"

export default function PokemonDetails({ model, min, max, stats, banColor, players, onBan, onPlayerPick, onUnpick }: PokemonDetailsProps) {
    const [visibleTab, setVisibleTab] = useState<DetailTab>("stats")

    function handleBan() {
        if(onBan) {
            onBan(model.species)
        }
    }

    function handlePlayerPick(index: number) {
        if(onPlayerPick) {
            onPlayerPick(model.species, index)
        }
    }

    function handleUnpick() {
        if(onUnpick) {
            onUnpick(model.species)
        }
    }

    return (
        <div className="flex flex-col flex-grow gap-2 p-2">
            <div className="flex flex-row justify-center items-center gap-2">
                <div className="relative">
                    <img src={model.sprite ?? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"} alt={properName(model.name)} width="100%" height="100%" />
                    {model.isShiny && <span className="absolute top-0 left-0">🌟</span>}
                </div>
                <div className="flex flex-col flex-grow gap-1">
                    <h1 className="text-2xl font-bold text-center">{properName(model.name)}</h1>
                    <div className="flex flex-row justify-center items-center gap-1 text-sm">
                        {model.types.map((type) => 
                            <div key={`${model.name}_${type}`} className={`px-2 py-0.5 pkmn-detail bg-${type}`}>
                                <span>{properName(type)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-row justify-center items-center gap-1 text-xs">
                        <button className="px-2 py-0.5 pkmn-detail bg-slate-600 hover:bg-slate-500" onClick={() => setVisibleTab("stats")}>
                            <span>Stats</span>
                        </button>
                        <button className="px-2 py-0.5 pkmn-detail bg-slate-600 hover:bg-slate-500" onClick={() => setVisibleTab("moves")}>
                            <span>Moves</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col flex-grow">
                <div className="max-h-[35vh] overflow-x-hidden overflow-y-auto">
                    {visibleTab === "stats" && <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-0.5">
                            <PokemonStatRow label={"Base Stat Total"} current={model.baseStatTotal} min={min?.total} max={max?.total} stats={stats?.total} />
                            <PokemonStatRow label={"HP"} current={model.stats.hp} min={min?.hp} max={max?.hp} stats={stats?.hp} />
                            <PokemonStatRow label={"Attack"} current={model.stats.attack} min={min?.attack} max={max?.attack} stats={stats?.attack} />
                            <PokemonStatRow label={"Defense"} current={model.stats.defense} min={min?.defense} max={max?.defense} stats={stats?.defense} />
                            <PokemonStatRow label={"Special Attack"} current={model.stats.specialAttack} min={min?.specialAttack} max={max?.specialAttack} stats={stats?.specialAttack} />
                            <PokemonStatRow label={"Special Defense"} current={model.stats.specialDefense} min={min?.specialDefense} max={max?.specialDefense} stats={stats?.specialDefense} />
                            <PokemonStatRow label={"Speed"} current={model.stats.speed} min={min?.speed} max={max?.speed} stats={stats?.speed} />
                        </div>
                        <div className="flex flex-row flex-wrap justify-center items-center gap-1 text-sm">
                            <div className="mr-2">{model.abilities.length > 1 ? "Abilities" : "Ability"}</div>
                            {model.abilities.map((ability) => 
                                <div key={`${model.name}_${ability}`} className="px-2 py-0.5 pkmn-detail text-black bg-white">
                                    <span>{properName(ability)}</span>
                                </div>
                            )}
                        </div>
                    </div>}
                    {visibleTab === "moves" && <div className="flex flex-row flex-wrap justify-evenly items-center gap-1 px-1 text-sm">
                        <div className="mr-2">Moveset</div>
                        {model.moves.map((move) => 
                            <div key={`${model.name}_${move}`} className="flex-grow px-1 pkmn-detail text-xs text-center text-black bg-neutral-100 even:bg-slate-200">
                                <span>{properName(move)}</span>
                            </div>
                        )}
                    </div>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
                <button className="px-2 py-1 bg-gray-500 rounded-md hover:grayscale-[0.5] hover:brightness-125" style={{ backgroundColor: banColor }} onClick={handleBan}>Ban</button>
                <button className="px-2 py-1 bg-gray-500 rounded-md hover:grayscale-[0.5] hover:brightness-125" onClick={handleUnpick}>Reset Pick</button>
                {players.map((player, index) =>
                    <button key={`player_${index}`} className="px-2 py-1 bg-gray-500 rounded-md hover:grayscale-[0.5] hover:brightness-125" style={{ backgroundColor: player.color }} onClick={() => handlePlayerPick(index)}>{possessive(player.name)} Pick</button>
                )}
            </div>
        </div>
    )
}