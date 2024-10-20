/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react"
import Head from "next/head"
import { useLocalStorage } from "usehooks-ts"
import { PokeballIcon } from "@components/icons"
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
    const [showFullList, setShowFullList] = useState<boolean>(false)

	const leftPokemon = pokemon[leftIndex]
	const rightPokemon = pokemon[rightIndex]
	//console.log(leftIndex, leftPokemon, rightIndex, rightPokemon)

	const [comparison, setComparison, removeComparison] = useLocalStorage<PokemonScore[]>("comparison", [])
	const totalMatches = comparison.map((pokemon) => pokemon.matches).reduce((p, q) => p + q, 0) / 2
	const fullList = Array.from(comparison).sort((p, q) => q.elo - p.elo)
	const topTen = fullList.slice(0, 10)
	const bottomTen = Array.from(fullList).reverse().slice(0, 10).reverse()

	const [isWinnerStays, setIsWinnerStays] = useLocalStorage<boolean>("winner_stays", false)

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
		const mostMatches = clone.reduce((p, q) => { return p.matches > q.matches ? p : q }).matches
		if(isWinnerStays && foundWinner.matches < mostMatches) {
			randomizeLoser(loser)
		} else {
			randomizePokemon()
		}
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
		setIsWinnerStays(false)
	}

	function getRandomPokemonIndex() {
		return Math.floor(Math.random() * pokemon.length)
	}

	function randomizeLoser(loser: PokemonData) {
		const loserIndex = pokemon.findIndex((pokemon) => pokemon.number === loser.number)
		let newIndex = getRandomPokemonIndex()
		if(loserIndex < 0) {
			randomizePokemon()
		} else if(loserIndex === leftIndex) {
			while(leftIndex === newIndex) newIndex = getRandomPokemonIndex()
			setLeftIndex(newIndex)
		} else {
			while(rightIndex === newIndex) newIndex = getRandomPokemonIndex()
			setRightIndex(newIndex)
		}
	}

	function randomizePokemon() {
		const newLeftIndex = getRandomPokemonIndex()
		let newRightIndex = getRandomPokemonIndex()
		while(newRightIndex === newLeftIndex) newRightIndex = getRandomPokemonIndex()
		setLeftIndex(newLeftIndex)
		setRightIndex(newRightIndex)
	}

	function showList() {
		setShowFAQ(false)
		setShowFullList(true)
	}

	return (
		<div className="w-screen h-dvh flex flex-col text-white overflow-hidden">
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
			<div className="h-full py-2 lg:py-6 flex flex-col items-center justify-center bg-black">
				{isClient && pokemon.length && (
					<>
						<div className="flex flex-row justify-center gap-2 text-sm lg:text-base">
							{totalMatches >= 500 && <button className="group relative rounded-md bg-neutral-600 hover:bg-neutral-500">
								<div className="flex flex-row gap-4 px-2 py-1" onClick={() => setIsWinnerStays(!isWinnerStays)}>
									<div className="z-10">🎲</div>
									<div className="z-10">🏆</div>
								</div>
								<div className={`absolute top-0 translate-y-0 ${isWinnerStays ? 'translate-x-9' : 'translate-x-0'} h-full w-[2.125rem] lg:w-10 rounded-md bg-slate-500 group-hover:bg-slate-400 transition-transform`}>&nbsp;</div>
								<div className="hidden group-hover:block px-2 py-1 absolute top-8 lg:top-9 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap text-black bg-white/70 rounded-md">
									<div>
										<span className="hidden lg:inline-block">Matchup Type:&nbsp;</span>
										<span>{isWinnerStays ? "Winner Stays" : "Random"}</span>
									</div>
									{isWinnerStays && <small>(until they don&apos;t)</small>}
								</div>
							</button>}
							<div className="group relative px-2 py-1 rounded-md bg-slate-800">
								<div className="flex flex-row items-center lg:gap-1">
									<span className="whitespace-nowrap hidden lg:inline">{comparison.length} / {pokemon.length} seen</span>
									<span className="lg:hidden">{Math.round(comparison.length / pokemon.length * 1000) / 10}%&nbsp;</span>
									<PokeballIcon className="lg:hidden" />
								</div>
								<div className="hidden group-hover:block lg:group-hover:hidden px-2 py-1 absolute -bottom-8 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap text-black bg-white/70 rounded-md">
									{comparison.length.toLocaleString()} of {pokemon.length.toLocaleString()} Pokémon Seen
								</div>
							</div>
							<div className="group relative px-2 py-1 rounded-md bg-slate-800">
								<div className="flex flex-row items-center lg:gap-1">
									<span className="hidden lg:inline">{totalMatches.toLocaleString()} compared</span>
									<span className="lg:hidden">{getTruncatedNumber(totalMatches)} ⚔</span>
								</div>
								<div className="hidden group-hover:block lg:group-hover:hidden px-2 py-1 absolute -bottom-8 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap text-black bg-white/70 rounded-md">
									{totalMatches.toLocaleString()} Matchups Completed
								</div>
							</div>
							<button className="px-3 py-1 rounded-md bg-neutral-600 hover:bg-neutral-500" onClick={() => setShowFAQ(true)}>?</button>
							<button className="px-2 py-1 rounded-md bg-red-800 hover:bg-red-700" onClick={reset}>Reset</button>
						</div>
						<div className="flex-grow"></div>
						<h1 className="text-xl md:text-3xl font-bold lg:mb-4 text-center">Which of these two do you like more?</h1>
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
            {showFAQ && <PopOverlay className="w-[90vw] h-[90svh] md:w-[40vw] md:h-[60vh]">
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
						<p>If you wanna see your full list of Pokémon ranked from most to least favorite, try <button className="underline" onClick={showList}>this</button>.</p>
						<p>Have fun clicking on buttons and let me know if you encounter any issues or have any suggestions at <a className="underline" href="https://twitter.com/yoorilikeglass" target="_blank" rel="noreferrer">@yoorilikeglass</a> or <a className="underline" href="https://bsky.app/profile/yoori.space" target="_blank" rel="noreferrer">@yoori.space</a>.</p>
                        <p>This website is powered by <a className="underline" href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a> and <a className="underline" href="https://vercel.com/" target="_blank" rel="noreferrer">Vercel</a>.</p>
                    </div>
                </div>
            </PopOverlay>}
			{showFullList && <PopOverlay className="w-screen h-dvh md:w-[60vw] md:h-[80vh]">
                <div className="h-full flex flex-col bg-neutral-900 rounded-lg overflow-hidden">
					<div className="flex flex-col gap-4">
						<div className="flex flex-row items-start pt-6 px-4 gap-4 md:gap-1 font-bold">
							<div className="flex flex-col flex-grow items-center text-lg lg:text-4xl">
								<span>Your Favorite Pokemon</span>
								<span>(in order, all of them)</span>
							</div>
							<button className="px-4 py-2 font-semibold bg-neutral-700 hover:bg-neutral-600 rounded-md" onClick={() => setShowFullList(false)}>Close</button>
						</div>
						<hr className="mx-2 lg:mx-4 border-slate-600" />
					</div>
					<div className="grid grid-cols-5 lg:grid-cols-8 justify-items-center pt-4 pb-6 px-4 overflow-x-hidden overflow-y-auto">
						{fullList.map((pokemon, index) => <PokemonWithElo key={pokemon.number} pokemon={pokemon} rank={index + 1} />)}
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

type PokemonWithEloProps = {
	pokemon: PokemonScore,
	rank?: number
}

function PokemonWithElo({ pokemon, rank }: PokemonWithEloProps) {
	return (
		<div className="group relative w-10 h-10 md:w-16 md:h-16">
			<img alt={`${getPokemonName(pokemon.name)} (${Math.round(pokemon.elo ?? 1500)})`} src={pokemon.image} width="100%" height="100%" />
			<div className="hidden group-hover:block px-2 py-1 absolute top-0 left-1/2 -translate-y-8 -translate-x-1/2 z-10 whitespace-nowrap text-black bg-white/70 rounded-md">
				{rank && <span className="italic">#{rank}&nbsp;</span>}
				<span className="font-medium">{getPokemonName(pokemon.name)}&nbsp;</span>
				<span>({Math.round(pokemon.elo ?? 1500)})</span>
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
		<div className="w-full lg:w-auto flex flex-col gap-2 px-4">
			<h1 className="text-lg font-bold">{title}</h1>
			<hr className="mx-2 lg:mx-4 border-slate-600" />
			<div className="grid grid-cols-5 lg:flex lg:flex-row gap-2 items-center justify-center justify-items-center">
				{list.map((pokemon) => <PokemonWithElo key={pokemon.number} pokemon={pokemon} />)}
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

function getTruncatedNumber(num: number) {
	return num > 9999 ? `${Math.round(num / 100) / 10}k` : num.toLocaleString()
}