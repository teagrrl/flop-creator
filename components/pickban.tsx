import React, { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { LookupApiResponse } from "@api/lookup"
import { FormFilter, PokemonModel, SpeciesModel } from "@data/pokemon"
import PokemonCard from "@components/pokemoncard"
import PickedPokemon from "@components/pickedpokemon"
import PokemonDetails from "@components/pokemondetails"
import { SettingsData } from "@components/settings"
import { apiFetcher, UndefinedFilter } from "@helpers/utilities"

type PickBanProps = {
    settings: SettingsData,
}

export default function PickBan({ settings }: PickBanProps) {
    const response = useSWR<LookupApiResponse>(`/api/lookup?names=${getLookupNames(settings.names)}`, apiFetcher)

    const [variantIndex, setVariantIndex] = useState<number>(0)
    const [selectedPokemon, setSelectedPokemon] = useState<PokemonModel | null>(null)
    const [bannedPicks, setBannedPicks] = useState<string[]>([])
    const [p1Picks, setP1Picks] = useState<string[]>([])
    const [p2Picks, setP2Picks] = useState<string[]>([])
    const [showError, setShowError] = useState<boolean>(true)

    const error = response.data?.error
    const models = response.data?.pokemon ?? []
    const p1PickModels = p1Picks.map((pick) => models.find((model) => model.name === pick)).filter(UndefinedFilter<SpeciesModel>())
    const p2PickModels = p2Picks.map((pick) => models.find((model) => model.name === pick)).filter(UndefinedFilter<SpeciesModel>())

    const poolStats = getPoolStats(models, settings.showMega, settings.showGmax)

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
        if(bannedPicks.length >= settings.bans * 2) {
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
        if(p1Picks.length >= settings.picks) {
            alert(`${settings.player1.name} has picked enough Pokemon!`)
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
        if(p2Picks.length >= settings.picks) {
            alert(`${settings.player2.name} has picked enough Pokemon!`)
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
                                <PokemonCard key={model.name} name={model.name} model={filteredPokemonForms(model, variantIndex, settings.showMega, settings.showGmax)} bgOverride={bannedPicks.includes(model.name) ?  settings.banColor : p1Picks.includes(model.name) ? settings.player1.color : p2Picks.includes(model.name) ? settings.player2.color : undefined} onClick={() => viewPokemonDetails(filteredPokemonForms(model, variantIndex, settings.showMega, settings.showGmax))} />
                            )}
                        </div>
                    </div>
                    <div className="w-80 flex overflow-hidden">
                        <div className="flex flex-col flex-grow">
                            {error && showError && <div className="flex flex-col gap-1 px-2 py-1 bg-red-800/80">
                                <h2 className="text-xl font-bold">Issues</h2>
                                <p className="text-sm">{error}</p>
                                <button className="font-semibold bg-slate-300/20 hover:bg-slate-300/40" onClick={() => setShowError(false)}>Dismiss</button>
                            </div>}
                            <div className="w-full relative overflow-hidden">
                                <div className="absolute h-full picks-anim"></div>
                                <div className="flex flex-row flex-wrap items-center overflow-hidden">
                                    <div className="px-2 font-bold">{settings.player1.name}</div>
                                    {p1PickModels.map((model) => 
                                        <PickedPokemon key={model.name} model={model.data[variantIndex % model.data.length]} color={settings.player1.color} />
                                    )}
                                    {Array.from(Array(settings.picks - p1PickModels.length)).map((und, index) =>
                                        <PickedPokemon key={`p1_${index}`} color={"#333333"} />
                                    )}
                                </div>
                                <div className="flex flex-row flex-wrap items-center overflow-hidden">
                                    <div className="px-2 font-bold">{settings.player2.name}</div>
                                    {p2PickModels.map((model) => 
                                        <PickedPokemon key={model.name} model={model.data[variantIndex % model.data.length]} color={settings.player2.color} />
                                    )}
                                    {Array.from(Array(settings.picks - p2PickModels.length)).map((und, index) =>
                                        <PickedPokemon key={`p2_${index}`} color={"#333333"} />
                                    )}
                                </div>
                            </div>
                            {selectedPokemon && <PokemonDetails model={selectedPokemon} stats={poolStats} banColor={settings.banColor} player1={settings.player1} player2={settings.player2} onBan={handleBan} onP1Pick={handleP1Pick} onP2Pick={handleP2Pick} onUnpick={handleUnpick} />}
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

function getLookupNames(names: string[]) {
    return names.map((name) => 
        name.trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\d\s-]+/g, "").replace(/\s+/g, "-")
    ).join(",")
}

function getPoolStats(models: SpeciesModel[], showMega?: boolean, showGmax?: boolean) {
    const poolSortDesc = (n: number, m: number) => m - n
    const poolStats = models
        .map((model) => model.data).flat()
        .filter(FormFilter(showMega, showGmax))
        .reduce((stats, model) => {
            stats.hp.push(model.stats.hp)
            stats.attack.push(model.stats.attack)
            stats.defense.push(model.stats.defense)
            stats.specialAttack.push(model.stats.specialAttack)
            stats.specialDefense.push(model.stats.specialDefense)
            stats.speed.push(model.stats.speed)
            stats.total.push(model.baseStatTotal)
            return stats
        }, { 
            hp: [] as number[], 
            attack: [] as number[], 
            defense: [] as number[], 
            specialAttack: [] as number[], 
            specialDefense: [] as number[], 
            speed: [] as number[], 
            total: [] as number[], 
        })
    poolStats.hp.sort(poolSortDesc)
    poolStats.attack.sort(poolSortDesc)
    poolStats.defense.sort(poolSortDesc)
    poolStats.specialAttack.sort(poolSortDesc)
    poolStats.specialDefense.sort(poolSortDesc)
    poolStats.speed.sort(poolSortDesc)
    poolStats.total.sort(poolSortDesc)

    return poolStats
}

function filteredPokemonForms(model: SpeciesModel, index: number, showMega?: boolean, showGmax?: boolean) {
    const forms = model.data.filter(FormFilter(showMega, showGmax))
    return forms[index % forms.length]
}