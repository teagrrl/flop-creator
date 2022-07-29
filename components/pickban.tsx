import React, { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { LookupApiResponse } from "@api/lookup"
import { PokemonModel, SpeciesModel } from "@data/pokemon"
import PokemonCard from "@components/pokemoncard"
import PickedPokemon from "@components/pickedpokemon"
import PokemonDetails from "@components/pokemondetails"
import { PlayerData } from "@components/settings"

type PickBanProps = {
    names: string[],
    bans: number,
    picks: number,
    banColor: string,
    player1: PlayerData,
    player2: PlayerData,
}

const apiFetcher = (url: string) => fetch(url)
    .then(async (response) => {
        const data = await response.json()
        if(!response.ok) {
            const error = data.error ?? response.status
            return Promise.reject(error)
        }
        return data
    })
    .catch((error) => error)

export default function PickBan({ names, bans, picks, banColor, player1, player2 }: PickBanProps) {
    const response = useSWR<LookupApiResponse>(`/api/lookup?names=${names.join(",")}`, apiFetcher)

    const [variantIndex, setVariantIndex] = useState<number>(0)
    const [selectedPokemon, setSelectedPokemon] = useState<PokemonModel | null>(null)
    const [bannedPicks, setBannedPicks] = useState<string[]>([])
    const [p1Picks, setP1Picks] = useState<string[]>([])
    const [p2Picks, setP2Picks] = useState<string[]>([])

    const models = response.data?.pokemon ?? []
    const undefinedFilter = (model: SpeciesModel | undefined): model is SpeciesModel => model !== undefined
    const p1PickModels = p1Picks.map((pick) => models.find((model) => model.name === pick)).filter(undefinedFilter)
    const p2PickModels = p2Picks.map((pick) => models.find((model) => model.name === pick)).filter(undefinedFilter)

	useInterval(() => {
        setVariantIndex(variantIndex + 1)
	}, 15000)

    function viewPokemonDetails(model: PokemonModel) {
        setSelectedPokemon(model)
    }

    function getSpeciesModelByName(name: string) {
        return models.find((model) => model.data.filter((data) => data.name === name).length > 0)
    }

    function handleBan(name: string) {
        if(bannedPicks.length >= bans * 2) {
            alert("You've banned enough Pokemon!")
            return
        }
        const model = getSpeciesModelByName(name)
        if(model) {
            if(!bannedPicks.includes(model.name)) {
                setBannedPicks([...bannedPicks, model.name])
            }
            if(p1Picks.includes(model.name)) {
                setP1Picks(p1Picks.filter((name) => model.name !== name))
            }
            if(p2Picks.includes(model.name)) {
                setP2Picks(p2Picks.filter((name) => model.name !== name))
            }
        }
    }

    function handleP1Pick(name: string) {
        if(p1Picks.length >= picks) {
            alert(`${player1.name} has picked enough Pokemon!`)
            return
        }
        const model = getSpeciesModelByName(name)
        if(model) {
            if(bannedPicks.includes(model.name)) {
                setBannedPicks(bannedPicks.filter((name) => model.name !== name))
            }
            if(!p1Picks.includes(model.name)) {
                setP1Picks([...p1Picks, model.name])
            }
            if(p2Picks.includes(model.name)) {
                setP2Picks(p2Picks.filter((name) => model.name !== name))
            }
        }
    }

    function handleP2Pick(name: string) {
        if(p2Picks.length >= picks) {
            alert(`${player2.name} has picked enough Pokemon!`)
            return
        }
        const model = getSpeciesModelByName(name)
        if(model) {
            if(bannedPicks.includes(model.name)) {
                setBannedPicks(bannedPicks.filter((name) => model.name !== name))
            }
            if(p1Picks.includes(model.name)) {
                setP1Picks(p1Picks.filter((name) => model.name !== name))
            }
            if(!p2Picks.includes(model.name)) {
                setP2Picks([...p2Picks, model.name])
            }
        }
    }

    function handleUnpick(name: string) {
        const model = getSpeciesModelByName(name)
        if(model) {
            if(bannedPicks.includes(model.name)) {
                setBannedPicks(bannedPicks.filter((name) => model.name !== name))
            }
            if(p1Picks.includes(model.name)) {
                setP1Picks(p1Picks.filter((name) => model.name !== name))
            }
            if(p2Picks.includes(model.name)) {
                setP2Picks(p2Picks.filter((name) => model.name !== name))
            }
        }
    }

    return (
        <div className="flex flex-grow justify-center bg-neutral-900">
            {!models
                ? <div>Loading...</div>
                : <div className="flex flex-row overflow-hidden">
                    <div className="w-full h-full relative overflow-hidden">
                        <div className="absolute h-full selector-anim"></div>
                        <div className="h-full flex flex-row flex-wrap flex-grow gap-2 p-2 overflow-hidden">
                            {models.map((model) => 
                                <PokemonCard key={model.name} name={model.name} model={model.data[variantIndex % model.data.length]} bgOverride={bannedPicks.includes(model.name) ?  banColor : p1Picks.includes(model.name) ? player1.color : p2Picks.includes(model.name) ? player2.color : undefined} onClick={() => viewPokemonDetails(model.data[variantIndex % model.data.length])} />
                            )}
                        </div>
                    </div>
                    <div className="w-80 flex overflow-hidden">
                        <div className="flex flex-col flex-grow">
                            <div className="w-full relative overflow-hidden">
                                <div className="absolute h-full picks-anim"></div>
                                <div className="flex flex-row flex-wrap items-center overflow-hidden">
                                    <div className="px-2 font-bold">{player1.name}</div>
                                    {p1PickModels.map((model) => 
                                        <PickedPokemon key={model.name} model={model.data[variantIndex % model.data.length]} color={player1.color} />
                                    )}
                                    {Array.from(Array(picks - p1PickModels.length)).map((und, index) =>
                                        <PickedPokemon key={`p1_${index}`} color={"#333333"} />
                                    )}
                                </div>
                                <div className="flex flex-row flex-wrap items-center overflow-hidden">
                                    <div className="px-2 font-bold">{player2.name}</div>
                                    {p2PickModels.map((model) => 
                                        <PickedPokemon key={model.name} model={model.data[variantIndex % model.data.length]} color={player2.color} />
                                    )}
                                    {Array.from(Array(picks - p2PickModels.length)).map((und, index) =>
                                        <PickedPokemon key={`p2_${index}`} color={"#333333"} />
                                    )}
                                </div>
                            </div>
                            {selectedPokemon && <PokemonDetails model={selectedPokemon} banColor={banColor} player1={player1} player2={player2} onBan={handleBan} onP1Pick={handleP1Pick} onP2Pick={handleP2Pick} onUnpick={handleUnpick} />}
                        </div>
                    </div>
                </div>
            }

        </div>
    )
}

function useInterval(callback: Function, timeout?: number | null) {
	const timeoutRef = useRef<number>();
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		if (typeof timeout === 'number') {
			timeoutRef.current = window.setInterval(() => callbackRef.current(), timeout);
			return () => window.clearInterval(timeoutRef.current);
		}
	}, [timeout]);

	return timeoutRef;
}