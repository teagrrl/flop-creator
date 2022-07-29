import React, { useState } from "react"
import Image from "next/image"
import { PokemonModel } from "@data/pokemon";
import { properName } from "@helpers/utilities";
import { PlayerData } from "@components/settings";

type PokemonDetailsProps = {
    model: PokemonModel,
    banColor: string,
    player1: PlayerData,
    player2: PlayerData,
    onBan?: Function,
    onP1Pick?: Function,
    onP2Pick?: Function,
    onUnpick?: Function,
}

type DetailTab = "stats" | "moves"

export default function PokemonDetails({ model, banColor, player1, player2, onBan, onP1Pick, onP2Pick, onUnpick }: PokemonDetailsProps) {
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
                <Image src={model.sprite ?? "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"} alt={model.name} layout="intrinsic" width="100%" height="100%" />
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
                            <div className="flex flex-row gap-2">
                                <span className="flex-grow font-semibold">Base Stat Total</span>
                                <span>{model.baseStatTotal}</span>
                            </div>
                            <hr />
                            <div className="flex flex-row gap-2">
                                <span className="flex-grow font-semibold">HP</span>
                                <span>{model.stats.hp}</span>
                            </div>
                            <div className="flex flex-row gap-2">
                                <span className="flex-grow font-semibold">Attack</span>
                                <span>{model.stats.attack}</span>
                            </div>
                            <div className="flex flex-row gap-2">
                                <span className="flex-grow font-semibold">Defense</span>
                                <span >{model.stats.defense}</span>
                            </div>
                            <div className="flex flex-row gap-2">
                                <span className="flex-grow font-semibold">Special Attack</span>
                                <span>{model.stats.specialAttack}</span>
                            </div>
                            <div className="flex flex-row gap-2">
                                <span className="flex-grow font-semibold">Special Defense</span>
                                <span>{model.stats.specialDefense}</span>
                            </div>
                            <div className="flex flex-row gap-2">
                                <span className="flex-grow font-semibold">Speed</span>
                                <span>{model.stats.speed}</span>
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