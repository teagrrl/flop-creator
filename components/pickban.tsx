import React, { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { LookupApiResponse } from "@api/lookup"
import { FormFilter, PokemonModel, sortLabels, SortType, SpeciesModel, StatComparator } from "@data/pokemon"
import { apiFetcher, possessive, UndefinedFilter } from "@helpers/utilities"
import { SettingsData } from "@components/settings"
import PokemonCard from "@components/pokemoncard"
import PickedPokemon from "@components/pickedpokemon"
import PokemonDetails from "@components/pokemondetails"
import PopOverlay from "@components/popoverlay"
import PokemonCompare from "@components/pokemoncompare"

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

    const leftPlayers = settings.players.filter((player, index) => index % 2 === 0)
    const rightPlayers = settings.players.filter((player, index) => index % 2 === 1)
    const poolStats = getPoolStats(models, settings.showMega, settings.showGmax)

	useInterval(() => {
        setVariantIndex(variantIndex + 1)
	}, 15000)

    function updateSortType() {
        setSort(sortLabels[(sortLabels.findIndex((label) => label.type === sort) + 1) % sortLabels.length].type)
    }

    function viewPokemonDetails(model?: PokemonModel) {
        setSelectedPokemon(model ?? null)
    }

    function handleBan() {
        if(bannedPicks.length >= settings.bans * settings.players.length) {
            alert("You've banned enough Pokemon!")
            return
        }
        if(selectedPokemon) {
            if(!bannedPicks.includes(selectedPokemon.species)) {
                setBannedPicks([...bannedPicks, selectedPokemon.species])
            }
            setPickedPokemon(pickedPokemon.map((playerPicks) => playerPicks.filter((name) => selectedPokemon.species !== name)))
        }
    }

    function handlePlayerPick(num: number) {
        if(pickedPokemon[num].length >= settings.picks) {
            alert(`${settings.players[num].name} has picked enough Pokemon!`)
            return
        }
        if(selectedPokemon) {
            if(bannedPicks.includes(selectedPokemon.species)) {
                setBannedPicks(bannedPicks.filter((name) => selectedPokemon.species !== name))
            }
            setPickedPokemon(pickedPokemon.map((playerPicks, index) => {
                if(num === index && !playerPicks.includes(selectedPokemon.species)) {
                    return [...playerPicks, selectedPokemon.species]
                }
                if(num !== index && playerPicks.includes(selectedPokemon.species)) {
                    return playerPicks.filter((name) => selectedPokemon.species !== name)
                }
                return playerPicks
            }))
        }
    }

    function handleUnpick() {
        if(selectedPokemon) {
            if(bannedPicks.includes(selectedPokemon.species)) {
                setBannedPicks(bannedPicks.filter((name) => selectedPokemon.species !== name))
            }
            setPickedPokemon(pickedPokemon.map((playerPicks) => playerPicks.filter((name) => selectedPokemon.species !== name)))
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
        <div className="flex flex-col flex-grow bg-neutral-900 overflow-hidden">
            <div className="h-full flex flex-row flex-grow">
                <div className="w-full relative overflow-hidden">
                    <div className="absolute h-full picks-anim"></div>
                    <div className="relative h-full flex flex-row">
                        {leftPlayers.map((player, num) => <div key={`player_${num * 2}`} className="flex flex-col flex-grow gap-0.5">
                            <button className="flex-grow font-bold text-2xl hover:bg-white/20" onClick={showTeams}>
                                <div className="relative w-full h-full flex justify-center items-center">{player.name}</div>
                            </button>
                            {pickedModels[num * 2].map((model) => 
                                <PickedPokemon key={model.name} model={model} color={player.color} align="right" onClick={viewPokemonDetails} />
                            )}
                            {Array.from(Array(settings.picks - pickedModels[num * 2].length)).map((player, index) =>
                                <PickedPokemon key={`player_${num}_${index}`} color={index === 0 ? settings.players[num * 2].color : "#222222"} isHighlighted={index === 0} />
                            )}
                        </div>)}
                    </div>
                </div>
                <div className="w-[75vw] min-w-[75vw] flex flex-col flex-grow">
                    {error && showError && <div className="flex flex-col gap-1 p-2 bg-red-800">
                        <div className="flex flex-row items-center ">
                            <h2 className="flex-grow text-xl font-bold">Issues</h2>
                            <button className="px-2 font-semibold bg-slate-300/20 hover:bg-slate-300/40" onClick={() => setShowError(false)}>Dismiss</button>
                        </div>
                        <p className="text-sm">{error}</p>
                    </div>}
                    <div className="flex flex-row p-2 gap-1 text-xs items-center">
                        <span className="font-semibold">Sort by:</span>
                        <button className="px-2 py-1 rounded-md bg-neutral-600/50 hover:bg-neutral-500/50" onClick={updateSortType}>
                            {sortLabels.find((label) => label.type === sort)?.label ?? "Abc"}
                        </button>
                        <div className="flex-grow"></div>
                        {selectedPokemon !== null && <div className="flex flex-row flex-wrap gap-1 items-end text-sm">
                            <button className="flex-grow px-2 py-0.5 bg-gray-500 rounded-md hover:grayscale-[0.5] hover:brightness-125" onClick={() => setSelectedPokemon(null)}>Hide Details</button>
                            {bannedPicks.length < settings.bans * settings.players.length && <button className="flex-grow px-2 py-0.5 bg-gray-500 rounded-md hover:grayscale-[0.5] hover:brightness-125" style={{ backgroundColor: settings.banColor }} onClick={handleBan}>Ban {selectedPokemon.species}</button>}
                            {settings.players.map((player, index) =>
                                pickedPokemon[index].length < settings.picks && <button key={`player_${index}`} className="flex-grow px-2 py-0.5 bg-gray-500 rounded-md hover:grayscale-[0.5] hover:brightness-125" style={{ backgroundColor: player.color }} onClick={() => handlePlayerPick(index)}>{possessive(player.name)} Pick</button>
                            )}
                            <button className="flex-grow px-2 py-0.5 bg-gray-500 rounded-md hover:grayscale-[0.5] hover:brightness-125" onClick={handleUnpick}>Reset {selectedPokemon.species}</button>
                        </div>}
                    </div>
                    <div className="w-full h-full relative overflow-hidden">
                        <div className="absolute h-full selector-anim"></div>
                        {models.length > 0
                            ? <div className="h-full overflow-x-hidden overflow-y-auto">
                                <div className="flex flex-row flex-wrap gap-2 p-2">
                                    {settings.allowRandom && <button className={`relative w-36 h-48 flex flex-col flex-grow justify-center items-center bg-neutral-900/80 hover:bg-neutral-700/60 shadow-md`} onClick={() => viewPokemonDetails(getRandomPokemon(variantIndex))}>
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
                                    {visibleModels.map((model) => 
                                        <PokemonCard key={model.species} name={model.species} model={model} bgOverride={getPickColor(model.species)} onClick={viewPokemonDetails} />
                                    )}
                                </div>
                            </div>
                            : <div className="h-full w-full min-w-[75vw] flex flex-grow items-center justify-center font-bold text-6xl">Loading...</div>
                        }
                    </div>
                    {selectedPokemon && <PokemonDetails model={selectedPokemon} stats={poolStats} />}
                </div>
                <div className="w-full relative overflow-hidden">
                    <div className="absolute h-full picks-anim"></div>
                    <div className="relative h-full flex flex-row">
                        {rightPlayers.map((player, num) => <div key={`player_${num * 2 + 1}`} className="flex flex-col flex-grow gap-0.5">
                            <button className="flex-grow font-bold text-2xl hover:bg-white/20" onClick={showTeams}>
                                <div className="relative w-full h-full flex justify-center items-center">{player.name}</div>
                            </button>
                            {pickedModels[num * 2 + 1].map((model) => 
                                <PickedPokemon key={model.name} model={model} color={player.color} align="left" onClick={viewPokemonDetails} />
                            )}
                            {Array.from(Array(settings.picks - pickedModels[num * 2 + 1].length)).map((player, index) =>
                                <PickedPokemon key={`player_${num}_${index}`} color={index === 0 ? settings.players[num * 2 + 1].color : "#222222"} isHighlighted={index === 0} />
                            )}
                        </div>)}
                    </div>
                </div>
                {showComparison && <PopOverlay width="90vw" height="90vh">
                    <PokemonCompare teams={pickedModels} stats={poolStats} players={settings.players} onClose={() => setShowComparison(false)} />
                </PopOverlay>}
            </div>
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