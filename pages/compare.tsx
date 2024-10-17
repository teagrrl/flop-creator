import { ChangeEvent, useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import { LookupApiResponse } from '@api/lookup'
import useSWR from 'swr'
import { apiFetcher, UndefinedFilter } from '@helpers/utilities'
import { FormFilter, PokemonModel, SpeciesModel } from '@data/pokemon'
import PokemonCard from '@components/pokemoncard'
import PokemonDetails from '@components/pokemondetails'
import { PokemonPoolStats } from '@components/pickban'

type ColorString = `#${string}`

export default function ComparePage() {
	const [isComparisonExpanded, setIsComparisonExpanded] = useState<boolean>(false)
    const [showError, setShowError] = useState<boolean>(true)
    const [player1Color, setPlayer1Color] = useState<ColorString>("#9d67ad")    
    const [player1Name, setPlayer1Name] = useState<string>("Player 1")
    const [player1Lookup, setPlayer1Lookup] = useState<string>("")
    const [player2Color, setPlayer2Color] = useState<ColorString>("#85ab6c")   
    const [player2Name, setPlayer2Name] = useState<string>("Player 2")
    const [player2Lookup, setPlayer2Lookup] = useState<string>("")
    const [variantIndex, setVariantIndex] = useState<number>(0)
    const [selectedPokemon, setSelectedPokemon] = useState<PokemonModel | null>(null)

    const combinedNames = player1Lookup.length > 0 && player2Lookup.length > 0 ? player1Lookup + "\r\n" + player2Lookup : null
    const lookupUrl = combinedNames ? `/api/lookup?names=${getLookupNames(combinedNames)}` : undefined
    const response = useSWR<LookupApiResponse>(lookupUrl, apiFetcher)

    const error = response.data?.error
    const models = response.data?.pokemon ?? []
    const player1Team = splitAndTrimNames(player1Lookup)
        .map((name) => models.find((model) => model.name === name))
        .filter(UndefinedFilter<SpeciesModel>())
        .map((model) => filteredPokemonForms(model, variantIndex))
    const player2Team = splitAndTrimNames(player2Lookup)
        .map((name) => models.find((model) => model.name === name))
        .filter(UndefinedFilter<SpeciesModel>())
        .map((model) => filteredPokemonForms(model, variantIndex))
    const poolStats = getPoolStats(models)

	useInterval(() => {
        setVariantIndex(variantIndex + 1)
	}, 15000)

    function onChangePlayer1Color(event: ChangeEvent<HTMLInputElement>) {
        setPlayer1Color(event.target.value as ColorString)
    }

    function onChangePlayer1Name(event: ChangeEvent<HTMLInputElement>) {
        setPlayer1Name(event.target.value)
    }

    function onChangePlayer1Lookup(event: ChangeEvent<HTMLTextAreaElement>) {
        setPlayer1Lookup(event.target.value)
    }

    function onChangePlayer2Color(event: ChangeEvent<HTMLInputElement>) {
        setPlayer2Color(event.target.value as ColorString)
    }

    function onChangePlayer2Name(event: ChangeEvent<HTMLInputElement>) {
        setPlayer2Name(event.target.value)
    }

    function onChangePlayer2Lookup(event: ChangeEvent<HTMLTextAreaElement>) {
        setPlayer2Lookup(event.target.value)
    }

    function openComparison() {
        setIsComparisonExpanded(true)
    }

    function closeComparison() {
        setIsComparisonExpanded(false)
        setShowError(true)
    }

    function filteredPokemonForms(model: SpeciesModel, index: number) {
        const forms = model.data.filter(FormFilter(false, false))
        return forms[index % forms.length]
    }

    function viewPokemonDetails(model?: PokemonModel) {
        setSelectedPokemon(model ?? null)
    }

	return (
		<div className="w-screen h-screen flex flex-col text-white overflow-hidden">
			<Head>
				<title>Compare Teams</title>
			</Head>
			{isComparisonExpanded 
                ? <div className="h-full flex flex-col items-center justify-center bg-black">
                    <div className="w-full h-full relative overflow-hidden">
                        <div className="absolute h-full selector-anim"></div>
                        {error && showError && <div className="absolute bottom-0 w-full flex flex-col gap-1 p-2 z-10 bg-red-800">
                            <div className="flex flex-row items-center">
                                <h2 className="flex-grow text-xl font-bold">Issues</h2>
                                <button className="px-2 font-semibold bg-slate-300/20 hover:bg-slate-300/40" onClick={() => setShowError(false)}>Dismiss</button>
                            </div>
                            <p className="text-sm">{error}</p>
                        </div>}
                        <button className="absolute top-2 right-2 px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600" onClick={closeComparison}>Back</button>
                        {models.length > 0
                            ? <div className="h-full flex flex-col justify-center">
                                <h2 className="px-4 text-2xl font-bold">{player1Name}</h2>
                                <div className="flex flex-row gap-2 p-2">
                                    {player1Team.map((model) => 
                                        <PokemonCard key={model.species} name={model.species} model={model} bgOverride={player1Color} onClick={viewPokemonDetails} />
                                    )}
                                </div>
                                <h2 className="px-4 text-2xl font-bold">{player2Name}</h2>
                                <div className="flex flex-row gap-2 p-2">
                                    {player2Team.map((model) => 
                                        <PokemonCard key={model.species} name={model.species} model={model} bgOverride={player2Color} onClick={viewPokemonDetails} />
                                    )}
                                </div>
                            </div>
                            : <div className="h-full w-full min-w-[75vw] flex flex-grow items-center justify-center font-bold text-6xl">Loading...</div>
                        }
                    </div>
                    {selectedPokemon && <PokemonDetails model={selectedPokemon} stats={poolStats} />}
                </div>
                : <div className="h-full flex flex-col items-center justify-center bg-black">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2">
                            <div className="flex flex-col gap-2">
                                <h3 className="flex flex-row gap-2 text-2xl font-bold">
                                    <input className="w-12 h-12 rounded-md text-black" type="color" value={player1Color} onChange={onChangePlayer1Color} />
                                    <input type="text" className="px-4 py-2 rounded-md text-black" placeholder="Player 1" value={player1Name} onChange={onChangePlayer1Name} />
                                </h3>
                                <textarea className="h-48 flex-grow px-4 py-2 rounded-md resize-none text-black" placeholder="Pokemon names separated by new lines..." value={player1Lookup} onChange={onChangePlayer1Lookup} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="flex flex-row gap-2 text-2xl font-bold">
                                    <input className="w-12 h-12 rounded-md text-black" type="color" value={player2Color} onChange={onChangePlayer2Color} />
                                    <input type="text" className="px-4 py-2 rounded-md text-black" placeholder="Player 2" value={player2Name} onChange={onChangePlayer2Name} />
                                </h3>
                                <textarea className="h-48 flex-grow px-4 py-2 rounded-md resize-none text-black" placeholder="Pokemon names separated by new lines.." value={player2Lookup} onChange={onChangePlayer2Lookup} />
                            </div>
                        </div>
                        <button className="w-full px-4 py-2 text-lg font-semibold rounded-md bg-gray-700 hover:bg-gray-600" onClick={openComparison}>Compare</button>
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

function splitAndTrimNames(names: string) {
    return names.split(/\r?\n/).map((name) => name.trim()).filter((name) => name.length > 0)
}

function getLookupNames(names: string) {
    return splitAndTrimNames(names).map((name) => 
        name.trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\d\s-]+/g, "").replace(/\s+/g, "-")
    ).join(",")
}

function getPoolStats(models: SpeciesModel[]) {
    const statNames = ["hp", "attack", "defense", "specialAttack", "specialDefense", "speed", "physicalBulk", "specialBulk"] as const
    const poolStatNames = [...statNames, "total"]
    const poolSortDesc = (n: number, m: number) => m - n
    const poolStats = models
        .map((model) => model.data).flat()
        .filter(FormFilter(false, false))
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