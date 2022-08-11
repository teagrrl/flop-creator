import React, { useState } from "react"
import Image from "next/image"
import { PokemonModel } from "@data/pokemon";
import { properName } from "@helpers/utilities";
import { PlayerData } from "@components/settings";

type PokemonStats = {
    hp: number,
    attack: number,
    defense: number,
    specialAttack: number,
    specialDefense: number,
    speed: number,
    total: number,
}

type PokemonPoolStats = {
    hp: number[],
    attack: number[],
    defense: number[],
    specialAttack: number[],
    specialDefense: number[],
    speed: number[],
    total: number[],
}

type PokemonDetailsProps = {
    model: PokemonModel,
    min?: PokemonStats,
    max?: PokemonStats,
    stats?: PokemonPoolStats,
    banColor: string,
    player1: PlayerData,
    player2: PlayerData,
    onBan?: Function,
    onP1Pick?: Function,
    onP2Pick?: Function,
    onUnpick?: Function,
}

type DetailTab = "stats" | "moves"

export default function PokemonDetails({ model, min, max, stats, banColor, player1, player2, onBan, onP1Pick, onP2Pick, onUnpick }: PokemonDetailsProps) {
    const [visibleTab, setVisibleTab] = useState<DetailTab>("stats")

    function handleBan() {
        if(onBan) {
            onBan(model.name)
        }
    }

    function handleP1Pick() {
        if(onP1Pick) {
            onP1Pick(model.name)
        }
    }

    function handleP2Pick() {
        if(onP2Pick) {
            onP2Pick(model.name)
        }
    }

    function handleUnpick() {
        if(onUnpick) {
            onUnpick(model.name)
        }
    }

    return (
        <div className="flex flex-col flex-grow gap-2 p-2">
            <div className="flex flex-row justify-center items-center gap-2">
                <div className="relative">
                    <Image src={model.sprite ?? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"} alt={model.name} layout="intrinsic" width="100%" height="100%" />
                    {model.isShiny && <span className="absolute top-0 left-0">🌟</span>}
                </div>
                <div className="flex flex-col gap-1">
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
                            <StatRow label={"Base Stat Total"} current={model.baseStatTotal} min={min?.total} max={max?.total} stats={stats?.total} />
                            <StatRow label={"HP"} current={model.stats.hp} min={min?.hp} max={max?.hp} stats={stats?.hp} />
                            <StatRow label={"Attack"} current={model.stats.attack} min={min?.attack} max={max?.attack} stats={stats?.attack} />
                            <StatRow label={"Defense"} current={model.stats.defense} min={min?.defense} max={max?.defense} stats={stats?.defense} />
                            <StatRow label={"Special Attack"} current={model.stats.specialAttack} min={min?.specialAttack} max={max?.specialAttack} stats={stats?.specialAttack} />
                            <StatRow label={"Special Defense"} current={model.stats.specialDefense} min={min?.specialDefense} max={max?.specialDefense} stats={stats?.specialDefense} />
                            <StatRow label={"Speed"} current={model.stats.speed} min={min?.speed} max={max?.speed} stats={stats?.speed} />
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
                <button className="px-2 py-1 bg-gray-500 rounded-md hover:font-bold" style={{ backgroundColor: banColor }} onClick={handleBan}>Ban</button>
                <button className="px-2 py-1 bg-gray-500 rounded-md hover:font-bold" onClick={handleUnpick}>Reset Pick</button>
                <button className="px-2 py-1 bg-gray-500 rounded-md hover:font-bold" style={{ backgroundColor: player1.color }} onClick={handleP1Pick}>{player1.name}&apos;s Pick</button>
                <button className="px-2 py-1 bg-gray-500 rounded-md hover:font-bold" style={{ backgroundColor: player2.color }} onClick={handleP2Pick}>{player2.name}&apos;s Pick</button>
            </div>
        </div>
    )
}

type StatRowProps = {
    label: string,
    current: number,
    min?: number,
    max?: number,
    stats?: number[],
}

function StatRow({ label, current, min, max, stats }: StatRowProps) {
    const percentileIndex = stats ? stats.findIndex((val) => val === current) : -1
    const percentile = stats ? (stats.length - percentileIndex) / stats.length : -1
    const ratio = percentile > 0 ? percentile : max ? (current - (min ?? 0)) / (max - (min ?? 0)) : undefined
    const colorClass = ratio !== undefined
        ? ratio > 0.9 
            ? "bg-emerald-700" 
            : ratio > 0.7 
                ? "bg-lime-700" 
                : ratio > 0.5 
                    ? "bg-yellow-700" 
                    : ratio > 0.3 
                        ? "bg-amber-700" 
                        : ratio > 0.1 
                            ? "bg-orange-700" 
                            : "bg-red-700" 
        : "bg-neutral-600"
    return (
        <div className="flex flex-row gap-2">
            <span className="flex-grow font-semibold">{label}</span>
            <div className="relative w-28 text-right">
                <span className="relative z-10">{current}</span>
                {(stats || min && max) && <div className="absolute right-0 bottom-0 w-full flex justify-end h-2 bg-neutral-700">
                    <div className={colorClass} style={{ width: ratio ? `${ratio * 7}rem` : "1px" }}></div>
                </div>}
            </div>
        </div>
    )
}