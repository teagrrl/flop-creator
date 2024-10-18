import React, { useEffect, useState } from "react"
import Image from "next/image"
import Head from "next/head"
import { useLocalStorage } from "usehooks-ts"
import * as SpeciesJson from "pages/api/species.json"

type SpeciesData = {
	pokemon: {
		number: number,
		name: string,
		varieties: PokemonData[],
	}[]
}

type PokemonData = {
	number: number,
	name: string,
	image: string,
}

type PokemonScore = PokemonData & { elo: number, matches: number }
type PokemonChange = PokemonData & { change: number } | undefined

export default function FavesPage() {
	const [isClient, setIsClient] = useState(false)
  
	useEffect(() => { setIsClient(true) }, []) // janky hack lol

    const data: SpeciesData = SpeciesJson
	const pokemon = data.pokemon.map((model) => model.varieties).flat()

	const [leftIndex, setLeftIndex] = useState<number>(getRandomPokemonIndex())
	const [rightIndex, setRightIndex] = useState<number>(getRandomPokemonIndex())
	const [recentWinner, setRecentWinner] = useState<PokemonChange>(undefined)
	const [recentLoser, setRecentLoser] = useState<PokemonChange>(undefined)

	const leftPokemon = pokemon[leftIndex]
	const rightPokemon = pokemon[rightIndex]
	//console.log(leftIndex, leftPokemon, rightIndex, rightPokemon)

	const [comparison, setComparison, removeComparison] = useLocalStorage<PokemonScore[]>("comparison", [])
	const totalMatches = comparison.map((pokemon) => pokemon.matches).reduce((p, q) => p + q, 0) / 2
	const topTen = Array.from(comparison).sort((p, q) => q.elo - p.elo).slice(0, 10)
	const bottomTen = Array.from(comparison).sort((p, q) => p.elo - q.elo).slice(0, 10).reverse()

	function getRandomPokemonIndex() {
		return Math.floor(Math.random() * pokemon.length)
	}

	function comparePokemon(winner: PokemonData, loser: PokemonData) {
		const startingElo = 1500
		const performanceValue = 400
		const minimumPercentage = 0.004

		const clone = Array.from(comparison)
		const foundWinnerIndex = comparison.findIndex((pokemon) => pokemon.number === winner.number)
		const foundLoserIndex = comparison.findIndex((pokemon) => pokemon.number === loser.number)
		
		const foundWinner = foundWinnerIndex > -1 ? comparison[foundWinnerIndex]: { ...winner, elo: startingElo, matches: 0 }
		const foundLoser = foundLoserIndex > -1 ? comparison[foundLoserIndex]: { ...loser, elo: startingElo, matches: 0 }
		const winnerElo = foundWinner.elo
		const loserElo = foundLoser.elo
		foundWinner.elo = Math.max(((winnerElo * foundWinner.matches) + (loserElo + performanceValue)) / (foundWinner.matches + 1), winnerElo * (1 + minimumPercentage))
		foundWinner.matches++
		foundLoser.elo = Math.min(((loserElo * foundLoser.matches) + (winnerElo - performanceValue)) / (foundLoser.matches + 1), loserElo * (1 - minimumPercentage))
		foundLoser.matches++

		if(foundWinnerIndex > -1) {
			clone[foundWinnerIndex] = foundWinner
		} else {
			clone.push(foundWinner)
		}
		if(foundLoserIndex > -1) {
			clone[foundLoserIndex] = foundLoser
		} else {
			clone.push(foundLoser)
		}
		setComparison(clone)
		const newLeftIndex = getRandomPokemonIndex()
		let newRightIndex = getRandomPokemonIndex()
		while(newRightIndex === newLeftIndex) newRightIndex = getRandomPokemonIndex()
		setLeftIndex(newLeftIndex)
		setRightIndex(newRightIndex)
		setRecentWinner({ ...foundWinner, change: foundWinner.elo - winnerElo })
		setRecentLoser({ ...foundLoser, change: foundLoser.elo - loserElo })
	}

	return (
		isClient && <div className="w-screen h-screen flex flex-col text-white overflow-hidden">
			<Head>
				<title>Your Favorite Pokemon</title>
			</Head>
			<div className="h-full py-6 flex flex-col items-center justify-center bg-black">
				{pokemon.length && (
					<>
						<div className="flex flex-row justify-center gap-2 text-sm lg:text-base">
							<span className="px-2 py-1 rounded-md bg-slate-800">{comparison.length} / {pokemon.length} seen</span>
							<span className="px-2 py-1 rounded-md bg-slate-800">{totalMatches} compared</span>
							<button className="px-2 py-1 rounded-md bg-red-800 hover:bg-red-700" onClick={() => removeComparison()}>Reset</button>
						</div>
						<div className="flex-grow"></div>
						<h1 className="text-xl md:text-3xl font-bold mb-4 text-center">Which of these two do you like more?</h1>
						<div className="w-full flex flex-row items-center gap-4">
							{recentWinner && <div className="hidden md:block relative px-6 text-center text-xs">
								<div className="relative h-14 w-14 lg:h-20 lg:w-20">
									<Image alt={recentWinner.name} src={recentWinner.image} fill sizes="15vw" />
								</div>
								<span className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md ${recentWinner.change > 0 ? "bg-emerald-600" : "bg-neutral-600"}`}>
									{plusMinusNumber(Math.round(recentWinner.change))}
								</span>
							</div>}
							<div className="flex-grow"></div>
							<div className="flex flex-col items-center gap-2">
								<div className="relative w-28 h-28 md:h-40 md:w-40">
									<Image alt={leftPokemon.name} src={leftPokemon.image} fill sizes="40vw" />
								</div>
								<button
									className="px-3 py-1 rounded-md bg-slate-700 hover:bg-slate-500"
									onClick={() => comparePokemon(leftPokemon, rightPokemon)}
								>
									{getPokemonName(leftPokemon.name)}
								</button>	
							</div>
							<div className="text-2xl md:text-4xl font-bold">OR</div>
							<div className="flex flex-col items-center gap-2">
								<div className="relative w-28 h-28 md:h-40 md:w-40">
									<Image alt={rightPokemon.name} src={rightPokemon.image} fill sizes="40vw" />
								</div>
								<button
									className="px-3 py-1 rounded-md bg-slate-700 hover:bg-slate-500"
									onClick={() => comparePokemon(rightPokemon, leftPokemon)}
								>
									{getPokemonName(rightPokemon.name)}
								</button>
							</div>
							<div className="flex-grow"></div>
							{recentLoser && <div className="hidden md:block relative px-6 text-center text-xs">
								<div className="relative h-20 w-20">
									<Image alt={recentLoser.name} src={recentLoser.image} fill sizes="15vw" />
								</div>
								<span className={`absolute -bottom-3 right-1/2 translate-x-1/2 px-2 py-1 rounded-md ${recentLoser.change < 0 ? "bg-rose-600" : "bg-neutral-600"}`}>
									{plusMinusNumber(Math.round(recentLoser.change))}
								</span>
							</div>}
						</div>
						<div className="flex-grow"></div>
						<PokemonList title="Your Top Ten (So Far)" list={topTen} />
						<PokemonList title="Your Least Favorites" list={bottomTen} />
					</>
				)}
			</div>
		</div>
	)
}

type PokemonListProps = {
	title: string,
	list: PokemonScore[],
}

function PokemonList({ title, list }: PokemonListProps) {
	return (
		<div className="flex flex-col gap-2 px-4">
			<h1 className="text-lg font-bold">{title}</h1>
			<hr className="w-full mx-4 border-slate-600" />
			<div className="flex flex-row gap-2 items-center justify-center flex-wrap">
				{list.map((pokemon) =>
					<div key={pokemon.number} className="group relative w-10 h-10 md:w-16 md:h-16">
						<Image alt={`${getPokemonName(pokemon.name)} (${Math.round(pokemon.elo ?? 1500)})`} src={pokemon.image} fill sizes="10vw" />
						<div className="hidden group-hover:block px-2 py-1 absolute top-0 left-1/2 -translate-y-8 -translate-x-1/2 z-10 whitespace-nowrap text-black bg-white/70 rounded-md">
							<span className="font-medium">{getPokemonName(pokemon.name)}</span> <span>({Math.round(pokemon.elo ?? 1500)})</span>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

function getPokemonName(name: string) {
	return name.split("-").map((word) => (word[0].toUpperCase() + word.slice(1))).join(" ")
}

function plusMinusNumber(num: number) {
	return num > 0 ? `+${num}` : num < 0 ? num : "no change"
}