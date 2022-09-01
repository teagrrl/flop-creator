import { SHINY_RATE, SpeciesModel } from "@data/pokemon";
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

export async function getPokemonDataByNames(names: string[]): Promise<Record<string, SpeciesModel | null>> {
    const speciesOrNullMap: Record<string, PokemonSpecies | null> = Object.fromEntries(await Promise.all(
        names.map(async (name) => {
            return [name, await api.getPokemonSpeciesByName(name.toLowerCase().trim())
                .then((data) => data)
                .catch((error) => {
                    console.log(`failed to fetch ${name}`)
                    console.error(error)
                    return null
                })]
        })
    ))
    const nameVarietiesMap: Record<string, Pokemon[]> = Object.fromEntries(await Promise.all(
        Object.keys(speciesOrNullMap).map(async (name) => {
            const speciesOrNull = speciesOrNullMap[name]
            return [name, speciesOrNull ? await lookupPokemonByName(speciesOrNull.varieties.map((variety) => variety.pokemon.name)) : null]
        })
    ))
    const speciesOrNullKeys = Object.keys(speciesOrNullMap)
    const forcedShinyIndex = process.env.FORCE_SHINY ? Math.floor(Math.random() * speciesOrNullKeys.length) : -1
    return Object.fromEntries(speciesOrNullKeys.map((name, index) => {
        const speciesOrNull = speciesOrNullMap[name]
        return [name, speciesOrNull ? new SpeciesModel(speciesOrNull, nameVarietiesMap[name] ?? [], index === forcedShinyIndex ? true : Math.random() < SHINY_RATE) : null]
    }))
}