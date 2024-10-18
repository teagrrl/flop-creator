/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react"
import Head from "next/head"
import { useLocalStorage } from "usehooks-ts"
import PopOverlay from "@components/popoverlay"
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
type PokemonChange = PokemonData & { change: number, hover?: string }

const STARTING_ELO = 1500
const PERFORMANCE_VALUE = 400
const MINIMUM_CHANGE_PERCENTAGE = 0.004

export default function FavesPage() {
	const [isClient, setIsClient] = useState(false)
  
	useEffect(() => { setIsClient(true) }, []) // janky hack lol

    const data: SpeciesData = SpeciesJson
	const pokemon = data.pokemon.map((model) => model.varieties).flat()

	const [leftIndex, setLeftIndex] = useState<number>(getRandomPokemonIndex())
	const [rightIndex, setRightIndex] = useState<number>(getRandomPokemonIndex())
	const [recentWinner, setRecentWinner] = useState<PokemonChange | undefined>(undefined)
	const [recentLoser, setRecentLoser] = useState<PokemonChange | undefined>(undefined)
    const [showFAQ, setShowFAQ] = useState<boolean>(false)

	const leftPokemon = pokemon[leftIndex]
	const rightPokemon = pokemon[rightIndex]
	//console.log(leftIndex, leftPokemon, rightIndex, rightPokemon)

	const [comparison, setComparison, removeComparison] = useLocalStorage<PokemonScore[]>("comparison", [])
	const totalMatches = comparison.map((pokemon) => pokemon.matches).reduce((p, q) => p + q, 0) / 2
	const topTen = Array.from(comparison).sort((p, q) => q.elo - p.elo).slice(0, 10)
	const bottomTen = Array.from(comparison).sort((p, q) => p.elo - q.elo).slice(0, 10).reverse()

	function comparePokemon(winner: PokemonData, loser: PokemonData) {
		const clone = Array.from(comparison)
		const foundWinnerIndex = comparison.findIndex((pokemon) => pokemon.number === winner.number)
		const foundLoserIndex = comparison.findIndex((pokemon) => pokemon.number === loser.number)
		
		const foundWinner = foundWinnerIndex > -1 ? comparison[foundWinnerIndex]: { ...winner, elo: STARTING_ELO, matches: 0 }
		const foundLoser = foundLoserIndex > -1 ? comparison[foundLoserIndex]: { ...loser, elo: STARTING_ELO, matches: 0 }
		const winnerElo = foundWinner.elo
		const loserElo = foundLoser.elo
		foundWinner.elo = Math.max(
			((winnerElo * foundWinner.matches) + (loserElo + PERFORMANCE_VALUE)) / (foundWinner.matches + 1), 
			winnerElo * (1 + MINIMUM_CHANGE_PERCENTAGE),
			winnerElo + 1,
		)
		foundWinner.matches++
		foundLoser.elo = Math.min(
			((loserElo * foundLoser.matches) + (winnerElo - PERFORMANCE_VALUE)) / (foundLoser.matches + 1), 
			loserElo * (1 - MINIMUM_CHANGE_PERCENTAGE), 
			loserElo - 1,
		)
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
		randomizePokemon()
		setRecentWinner({ ...foundWinner, change: foundWinner.elo - winnerElo, hover: getEloChangeText(winnerElo,foundWinner.elo) })
		setRecentLoser({ ...foundLoser, change: foundLoser.elo - loserElo, hover: getEloChangeText(loserElo, foundLoser.elo) })
	}

	/*function skipComparison(p1: PokemonData, p2: PokemonData) {
		const clone = Array.from(comparison)
		const p1Index = comparison.findIndex((pokemon) => pokemon.number === p1.number)
		const p2Index = comparison.findIndex((pokemon) => pokemon.number === p2.number)

		const p1Data = p1Index > -1 ? comparison[p1Index]: { ...p1, elo: STARTING_ELO, matches: 0 }
		const p2Data = p2Index > -1 ? comparison[p2Index]: { ...p2, elo: STARTING_ELO, matches: 0 }
		const p1Elo = p1Data.elo
		const p2Elo = p2Data.elo
		p1Data.elo = p1Data.matches > 0 ? p1Elo * p1Data.matches / (p1Data.matches + 1) : STARTING_ELO
		p1Data.matches++
		p2Data.elo = p2Data.matches > 0 ? p2Elo * p2Data.matches / (p2Data.matches + 1) : STARTING_ELO
		p2Data.matches++

		if(p1Index > -1) {
			clone[p1Index] = p1Data
		} else {
			clone.push(p1Data)
		}
		if(p2Index > -1) {
			clone[p2Index] = p2Data
		} else {
			clone.push(p2Data)
		}
		setComparison(clone)
		randomizePokemon()
		setRecentWinner({ ...p1Data, change: p1Data.elo - p1Elo })
		setRecentLoser({ ...p2Data, change: p2Data.elo - p2Elo })
	}*/

	function reset() {
		removeComparison()
		randomizePokemon()
	}

	function getRandomPokemonIndex() {
		return Math.floor(Math.random() * pokemon.length)
	}

	function randomizePokemon() {
		const newLeftIndex = getRandomPokemonIndex()
		let newRightIndex = getRandomPokemonIndex()
		while(newRightIndex === newLeftIndex) newRightIndex = getRandomPokemonIndex()
		setLeftIndex(newLeftIndex)
		setRightIndex(newRightIndex)
	}

	return (
		<div className="w-screen h-screen flex flex-col text-white overflow-hidden">
			<Head>
				<title>Your Favorite Pokemon</title>
				<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" key="viewport" />
				<meta name="description" content="Choose between Pokemon until you've found your favorites" key="description" />
				<meta name="twitter:card" content="summary" key="twsummary" />
				<meta name="twitter:description" content="Choose between Pokemon until you've found your favorites" key="twdescription" />
				<meta name="twitter:title" content="Your Favorite Pokemon" key="twtitle" />
				<meta property="og:type" content="website" key="ogtype" />
				<meta property="og:description" content="Choose between Pokemon until you've found your favorites" key="ogdescription" />
				<meta property="og:site_name" content="Your Favorite Pokemon" key="ogsitename" />
				<meta property="og:title" content="Your Favorite Pokemon" key="ogtitle" />
			</Head>
			<div className="h-full py-6 flex flex-col items-center justify-center bg-black">
				{isClient && pokemon.length && (
					<>
						<div className="flex flex-row justify-center gap-2 text-sm lg:text-base">
							<span className="px-2 py-1 rounded-md bg-slate-800">{comparison.length} / {pokemon.length} seen</span>
							<span className="px-2 py-1 rounded-md bg-slate-800">{totalMatches} compared</span>
							<button className="px-3 py-1 rounded-md bg-neutral-600 hover:bg-neutral-500" onClick={() => setShowFAQ(true)}>?</button>
							<button className="px-2 py-1 rounded-md bg-red-800 hover:bg-red-700" onClick={reset}>Reset</button>
						</div>
						<div className="flex-grow"></div>
						<h1 className="text-xl md:text-3xl font-bold mb-4 text-center">Which of these two do you like more?</h1>
						<div className="w-full flex flex-row items-center gap-4">
							{recentWinner && <PokemonHistory pokemon={recentWinner} />}
							<div className="flex-grow"></div>
							<PokemonSelector pokemon={leftPokemon} onSelect={() => comparePokemon(leftPokemon, rightPokemon)} />
							<div className="text-2xl md:text-4xl font-bold">OR</div>
							<PokemonSelector pokemon={rightPokemon} onSelect={() => comparePokemon(rightPokemon, leftPokemon)} />
							<div className="flex-grow"></div>
							{recentLoser && <PokemonHistory pokemon={recentLoser} />}
						</div>
						{/*<div className="py-2">
							<button className="px-3 py-1 rounded-md bg-neutral-600 hover:bg-neutral-500" onClick={() => skipComparison(leftPokemon, rightPokemon)}>Skip</button>
						</div>*/}
						<div className="flex-grow"></div>
						{comparison.length > 10 && <PokemonList title="Your Top Ten (So Far)" list={topTen} />}
						{comparison.length > 20 && <PokemonList title="Your Least Favorites" list={bottomTen} />}
					</>
				)}
			</div>
            {showFAQ && <PopOverlay className="w-[90vw] h-[90vh] md:w-[40vw] md:h-[60vh]">
                <div className="flex flex-col md:flex-row gap-4 p-4 py-6 overflow-auto bg-neutral-900 rounded-lg">
                    <div className="flex flex-row items-start md:items-center md:flex-col gap-4 md:gap-1 text-4xl font-bold">
                        <span>Your Favorite Pokemon</span>
                        <div className="flex flex-grow justify-center items-end">
                            <button className="px-4 py-2 font-semibold text-base bg-neutral-700 hover:bg-neutral-600 rounded-md" onClick={() => setShowFAQ(false)}>Close</button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 text-lg">
                        <p>You will be shown two Pokémon. Choose your favorite between the two. And then do it again and again until you&apos;re happy with your top ten list. Yes, it&apos;ll take forever. Yes, there are currently {pokemon.length} Pokémon to look at. There will be more. I&apos;ve tried to hand prune the list so you don&apos;t need to compare all fourteen forms of <a className="underline" href="https://www.serebii.net/pokedex-sm/774.shtml" target="_blank" rel="noreferrer">Minior</a> or every <a className="underline" href="https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_with_form_differences#Cosplay_Pikachu" target="_blank" rel="noreferrer">Cosplay Pikachu</a>.</p>
						<p>The numbers you see are part of the really bad faux-elo rating system I implemented. Maybe it&apos;ll become an actual elo rating system in the future. You might see numbers jump around a bunch but I promise it&apos;ll even out once you have done enough comparisons.</p>
						<p>Have fun clicking on buttons and let me know if you encounter any issues or have any suggestions at <a className="underline" href="https://twitter.com/yoorilikeglass" target="_blank" rel="noreferrer">@yoorilikeglass</a> or <a className="underline" href="https://bsky.app/profile/yoori.space" target="_blank" rel="noreferrer">@yoori.space</a>.</p>
                        <p>This website is powered by <a className="underline" href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a> and <a className="underline" href="https://vercel.com/" target="_blank" rel="noreferrer">Vercel</a>.</p>
                    </div>
                </div>
            </PopOverlay>}
		</div>
	)
}

type PokemonHistoryProps = {
	pokemon: PokemonChange,
}

function PokemonHistory({ pokemon }: PokemonHistoryProps) {
	return (
		<div className="group hidden md:block relative px-6 text-center text-xs">
			<div className="relative h-20 w-20">
				<img alt={pokemon.name} src={pokemon.image} width="100%" height="100%" />
			</div>
			<span className={`absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 px-2 py-1 rounded-md ${pokemon.change > 0 ? "bg-emerald-600" : ""}${pokemon.change === 0 ? "bg-neutral-600" : ""}${pokemon.change < 0 ? "bg-rose-600" : ""}`}>
				{plusMinusNumber(Math.round(pokemon.change))}
			</span>
			{pokemon.hover && (
				<div className="hidden group-hover:block absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-2 py-1 whitespace-nowrap text-black bg-white/70 rounded-md">
					<p className="font-bold">{getPokemonName(pokemon.name)}</p>
					<p>{pokemon.hover}</p>
				</div>
			)}
		</div>
	)
}

type PokemonSelectorProps = {
	pokemon: PokemonData,
	onSelect?: () => void,
}

function PokemonSelector({ pokemon, onSelect }: PokemonSelectorProps) {
	return (
		<div className="flex flex-col items-center gap-2">
			<div className="relative w-28 h-28 md:h-40 md:w-40">
				<img alt={pokemon.name} src={pokemon.image} width="100%" height="100%" />
			</div>
			<button
				className="px-3 py-1 rounded-md bg-slate-700 hover:bg-slate-500"
				onClick={onSelect}
			>
				{getPokemonName(pokemon.name)}
			</button>
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
						<img alt={`${getPokemonName(pokemon.name)} (${Math.round(pokemon.elo ?? 1500)})`} src={pokemon.image} width="100%" height="100%" />
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
	return num > 0 ? `+${num}` : num < 0 ? num : "±0"
}

function getEloChangeText(before: number, after: number) {
	return `${Math.round(before)} ⇒ ${Math.round(after)}`
}