import { SpeciesModel } from "@data/pokemon";
import { Pokemon, PokemonClient, PokemonSpecies } from "pokenode-ts";

const api = new PokemonClient()

export async function lookupPokemonByName(names: string[]) {
    const pokemonOrNull = await Promise.all(
        names.map(async (name) => {
            return await api.getPokemonByName(name)
                .then((data) => data)
                .catch((error) => {
                    console.error(error)
                    return null
                })
        })
    )
    return pokemonOrNull.filter((data: Pokemon | null): data is Pokemon => data !== null)
}

export async function getPokemonDataByNames(names: string[]): Promise<SpeciesModel[]> {
    const speciesOrNull = await Promise.all(
        names.map(async (name) => {
            return await api.getPokemonSpeciesByName(name)
                .then((data) => data)
                .catch((error) => {
                    console.error(error)
                    return null
                })
        })
    )
    const foundSpecies = speciesOrNull.filter((data: PokemonSpecies | null): data is PokemonSpecies => data !== null)
    const nameVarietiesMap: Record<string, Pokemon[]> = Object.fromEntries(await Promise.all(
        foundSpecies.map(async (species) => [species.name, await lookupPokemonByName(species.varieties.map((variety) => variety.pokemon.name))])
    ))
    return foundSpecies.map((species) => new SpeciesModel(species, nameVarietiesMap[species.name] ?? [])).filter((model) => model.data.length > 0)
}