import { apiFetcher } from "@helpers/utilities"
import useSWR from "swr"
import Image from "next/image"
import { useLocalStorage } from "usehooks-ts"

type BestApiResponse = {
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

export default function BestPage() {
    const response = useSWR<BestApiResponse>("/api/best", apiFetcher)
    const models = response.data?.pokemon ?? []
	const pokemon = models.map((model) => model.varieties).flat()

	const leftPokemon = pokemon[Math.ceil(Math.random() * pokemon.length)]
	const rightPokemon = pokemon[Math.ceil(Math.random() * pokemon.length)]
	console.log(leftPokemon, rightPokemon)

	const [comparison, setComparison, remmoveComparison] = useLocalStorage<PokemonScore[]>("comparison", [])
	const topTen = comparison.sort((p, q) => q.elo - p.elo).slice(0, 10)

	function comparePokemon(winner: PokemonData, loser: PokemonData) {
		const startingElo = 1500
		const performanceValue = 400

		const clone = Array.from(comparison)
		const foundWinnerIndex = comparison.findIndex((pokemon) => pokemon.number === winner.number)
		const foundLoserIndex = comparison.findIndex((pokemon) => pokemon.number === loser.number)
		
		const foundWinner = foundWinnerIndex > -1 ? comparison[foundWinnerIndex]: { ...winner, elo: startingElo, matches: 0 }
		const foundLoser = foundLoserIndex > -1 ? comparison[foundLoserIndex]: { ...loser, elo: startingElo, matches: 0 }
		foundWinner.elo = ((foundWinner.elo * foundWinner.matches) + (foundLoser.elo + performanceValue)) / (foundWinner.matches + 1)
		foundWinner.matches++
		foundLoser.elo = ((foundLoser.elo * foundLoser.matches) + (foundWinner.elo - performanceValue)) / (foundLoser.matches + 1)
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
	}
	console.log(comparison.slice(10, 50).map((score) => score.name + " " + score.elo))
	console.log(Array.from(comparison).reverse().slice(0, 10).map((score) => score.name + " " + score.elo))

	return (
		<div className="w-screen h-screen flex flex-col text-white overflow-hidden">
			<div className="h-full flex flex-col items-center justify-center bg-black">
				{pokemon.length && (
					<>
						<div className="flex-grow"></div>
						<h1 className="text-2xl font-bold mb-4">Which of these two do you like more?</h1>
						<div className="flex flex-row items-center gap-4">
							<div className="flex flex-col items-center gap-2">
								<div className="relative h-40 w-40">
									<Image alt={leftPokemon.name} src={leftPokemon.image} fill />
								</div>
								<button
									className="px-3 py-1 rounded-md bg-slate-700 hover:bg-slate-500"
									onClick={() => comparePokemon(leftPokemon, rightPokemon)}
								>
									{getPokemonName(leftPokemon.name)}
								</button>
							</div>
							<div className="text-4xl font-bold">- OR -</div>
							<div className="flex flex-col items-center gap-2">
								<div className="relative h-40 w-40">
									<Image alt={rightPokemon.name} src={rightPokemon.image} fill />
								</div>
								<button
									className="px-3 py-1 rounded-md bg-slate-700 hover:bg-slate-500"
									onClick={() => comparePokemon(rightPokemon, leftPokemon)}
								>
									{getPokemonName(rightPokemon.name)}
								</button>
							</div>
						</div>
						<div className="flex-grow"></div>
						<div className="text-center">{comparison.length} / {pokemon.length}</div>
						<div className="flex flex-row gap-2 items-center px-6 py-4">
							{topTen.map((pokemon) =>
								<div key={pokemon.number} className="group relative w-16 h-16">
									<Image alt={`${getPokemonName(pokemon.name)} (${Math.round(pokemon.elo ?? 1500)})`} src={pokemon.image} fill />
									<div className="hidden group-hover:block px-2 py-1 absolute bottom-0 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap text-black bg-white/70 rounded-md">
										{getPokemonName(pokemon.name)} ({Math.round(pokemon.elo ?? 1500)})
									</div>
								</div>
							)}
							<button onClick={() => remmoveComparison()}>Reset</button>
						</div>
					</>
				)}
			</div>
		</div>
	)
}

function getPokemonName(name: string) {
	return name.split("-").map((word) => (word[0].toUpperCase() + word.slice(1))).join(" ")
}