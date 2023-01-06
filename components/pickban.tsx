import React, { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { LookupApiResponse } from "@api/lookup"
import { FormFilter, PokemonModel, sortLabels, SortType, SpeciesModel, StatComparator } from "@data/pokemon"
import PokemonCard from "@components/pokemoncard"
import PickedPokemon from "@components/pickedpokemon"
import PokemonDetails from "@components/pokemondetails"
import PokemonCompare from "@components/pokemoncompare"
import { SettingsData } from "@components/settings"
import PopOverlay from "@components/popoverlay"
import { apiFetcher, UndefinedFilter } from "@helpers/utilities"

type PickBanProps = {
    settings: SettingsData,
}

export type PokemonPoolStats = {
    hp: number[],
    attack: number[],
    defense: number[],
    specialAttack: number[],
    specialDefense: number[],
    speed: number[],
    total: number[],
    physicalBulk: number[],
    specialBulk: number[],
}

export default function PickBan({ settings }: PickBanProps) {
    const response = useSWR<LookupApiResponse>(`/api/lookup?names=${getLookupNames(settings.names)}`, apiFetcher)

    const [sort, setSort] = useState<SortType>("name")
    const [variantIndex, setVariantIndex] = useState<number>(0)
    const [selectedPokemon, setSelectedPokemon] = useState<PokemonModel | null>(null)
    const [bannedPicks, setBannedPicks] = useState<string[]>([])
    const [pickedPokemon, setPickedPokemon] = useState<string[][]>(Array(settings.players.length).fill([]))
    const [showComparison, setShowComparison] = useState<boolean>(false)
    const [showError, setShowError] = useState<boolean>(true)

    const error = response.data?.error
    const models = response.data?.pokemon ?? []
    const visibleModels = models.map((species) => filteredPokemonForms(species, variantIndex)).sort(StatComparator(sort))
    /*const bannedModels = bannedPicks.map((pick) => models.find((model) => model.name === pick))
        .filter(UndefinedFilter<SpeciesModel>())
        .map((model) => filteredPokemonForms(model, variantIndex))*/
    const pickedModels = pickedPokemon.map((picks) =>
        picks.map((pick) => models.find((model) => model.name === pick))
            .filter(UndefinedFilter<SpeciesModel>())
            .map((model) => filteredPokemonForms(model, variantIndex))
    )

    const poolStats = getPoolStats(models, settings.showMega, settings.showGmax)

	useInterval(() => {
        setVariantIndex(variantIndex + 1)
	}, 15000)

    function updateSortType() {
        setSort(sortLabels[(sortLabels.findIndex((label) => label.type === sort) + 1) % sortLabels.length].type)
    }

    function viewPokemonDetails(model: PokemonModel) {
        setSelectedPokemon(model)
    }

    function getSpeciesModelByName(name: string) {
        return models.find((model) => model.name === name)
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
            setPickedPokemon(pickedPokemon.map((playerPicks) => playerPicks.filter((name) => model.name !== name)))
        }
    }

    function handlePlayerPick(name: string, num: number) {
        if(pickedPokemon[num].length >= settings.picks) {
            alert(`${settings.players[num].name} has picked enough Pokemon!`)
            return
        }
        const model = getSpeciesModelByName(name)
        if(model) {
            if(bannedPicks.includes(model.name)) {
                setBannedPicks(bannedPicks.filter((name) => model.name !== name))
            }
            setPickedPokemon(pickedPokemon.map((playerPicks, index) => {
                if(num === index && !playerPicks.includes(model.name)) {
                    return [...playerPicks, model.name]
                }
                if(num !== index && playerPicks.includes(model.name)) {
                    return playerPicks.filter((name) => model.name !== name)
                }
                return playerPicks
            }))
        }
    }

    function handleUnpick(name: string) {
        const model = getSpeciesModelByName(name)
        if(model) {
            if(bannedPicks.includes(model.name)) {
                setBannedPicks(bannedPicks.filter((name) => model.name !== name))
            }
            setPickedPokemon(pickedPokemon.map((playerPicks) => playerPicks.filter((name) => model.name !== name)))
        }
    }

    function getPickColor(name: string) {
        if(bannedPicks.includes(name)) return settings.banColor
        const playerIndex = pickedPokemon.findIndex((picks) => picks.includes(name))
        return playerIndex > -1 ? settings.players[playerIndex].color : undefined
    }

    function getRandomPokemon(index: number) {
        const unpickedModels = models.filter((model) => ![...bannedPicks, ...pickedPokemon.flat()].includes(model.name))
        const model = unpickedModels.length ? unpickedModels[Math.floor(Math.random() * unpickedModels.length)] : models[Math.floor(Math.random() * models.length)]
        return filteredPokemonForms(model, index)
    }
    
    function filteredPokemonForms(model: SpeciesModel, index: number) {
        const forms = model.data.filter(FormFilter(settings.showMega, settings.showGmax))
        return forms[index % forms.length]
    }

    function showTeams() {
        if(pickedPokemon.flat().length) {
            setShowComparison(!showComparison)
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
                            {visibleModels.map((model) => 
                                <PokemonCard key={model.species} name={model.species} model={model} bgOverride={getPickColor(model.species)} onClick={() => viewPokemonDetails(model)} />
                            )}
                            {settings.allowRandom && <button className={`relative w-[7vw] max-h-[25vh] flex flex-col flex-grow justify-center items-center bg-neutral-900/80 hover:bg-neutral-700/60 shadow-md`} onClick={() => viewPokemonDetails(getRandomPokemon(variantIndex))}>
                                <div className="flex flex-col flex-grow items-center justify-center overflow-hidden">
                                    <div className="w-20 h-20 text-6xl">🎲</div>
                                    <div className="text-lg font-semibold text-center">Random</div>
                                    <div className="absolute top-0 right-0 flex flex-wrap justify-end gap-0.5 text-xs">
                                        <div className={`px-2 py-0.5 pkmn-detail bg-questions text-center`}>
                                            <span>???</span>
                                        </div>
                                    </div>
                                </div>
                            </button>}
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
                                {/*<div className="flex flex-row flex-wrap items-center overflow-hidden">
                                    <div className="px-2 font-bold">Banned</div>
                                    {bannedModels.map((model) => 
                                        <PickedPokemon key={model.name} model={model} color={settings.banColor} />
                                    )}
                                    {Array.from(Array((settings.bans * 2) - bannedModels.length)).map((und, index) =>
                                        <PickedPokemon key={`ban_${index}`} color={"#333333"} />
                                    )}
                                </div>*/}
                                {settings.players.map((player, num) => 
                                    <div key={`player_${num}`} className="relative flex flex-row flex-wrap items-center overflow-hidden">
                                        <button className="h-11 px-2 font-bold -skew-x-[20deg] hover:bg-white/20" onClick={() => showTeams()}>
                                            <div className="relative skew-x-[20deg]">{player.name}</div>
                                        </button>
                                        {pickedModels[num].map((model) => 
                                            <PickedPokemon key={model.name} model={model} color={player.color} onClick={(model: PokemonModel) => viewPokemonDetails(model)} />
                                        )}
                                        {Array.from(Array(settings.picks - pickedModels[num].length)).map((und, index) =>
                                            <PickedPokemon key={`player_${num}_${index}`} color={"#333333"} />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-row p-1 gap-1 text-xs justify-center items-center">
                                <span className="font-semibold">Sort by:</span>
                                <button className="px-2 py-1 rounded-md bg-neutral-600/50 hover:bg-neutral-500/50" onClick={updateSortType}>
                                    {sortLabels.find((label) => label.type === sort)?.label ?? "Abc"}
                                </button>
                            </div>
                            {selectedPokemon && <PokemonDetails model={selectedPokemon} stats={poolStats} banColor={settings.banColor} players={settings.players} onBan={handleBan} onPlayerPick={handlePlayerPick} onUnpick={handleUnpick} />}
                        </div>
                    </div>
                    {showComparison && <PopOverlay width="90vw" height="90vh">
                        <PokemonCompare teams={pickedModels} stats={poolStats} players={settings.players} onClose={() => setShowComparison(false)} />
                    </PopOverlay>}
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
    const statNames = ["hp", "attack", "defense", "specialAttack", "specialDefense", "speed", "physicalBulk", "specialBulk"] as const
    const poolStatNames = [...statNames, "total"]
    const poolSortDesc = (n: number, m: number) => m - n
    const poolStats = models
        .map((model) => model.data).flat()
        .filter(FormFilter(showMega, showGmax))
        .reduce((stats, model) => {
            for(const name of statNames) {
                stats[name].push(model.stats[name])
            }
            stats.total.push(model.baseStatTotal)
            return stats
        }, Object.fromEntries(poolStatNames.map((name) => [name, [] as number[]])))
    for(const name of poolStatNames) {
        poolStats[name].sort(poolSortDesc)
    }
    return poolStats as PokemonPoolStats
}