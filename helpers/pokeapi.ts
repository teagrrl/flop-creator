import { SHINY_RATE, SpeciesModel } from "@data/pokemon";
import { Pokemon, PokemonClient, PokemonSpecies } from "pokenode-ts";

const api = new PokemonClient()

export async function listPokemonSpecies() {
    const speciesIds = []
    let page = 0
    let latestPage: { ids: number[], hasNext: boolean } = { ids: [], hasNext: true }
    do {
        latestPage = await listPokemonSpeciesPage(page)
        speciesIds.push(...latestPage.ids)
        page++
    } while(latestPage.hasNext)
    const speciesData = (await Promise.all(
        Array.from(new Set(speciesIds)).map(async (id) => {
            return await api.getPokemonSpeciesById(id)
                .then((data) => data)
                .catch((error) => {
                    console.error(error)
                    return null
                })
        })
    )).filter((data: PokemonSpecies | null): data is PokemonSpecies => data !== null)
    const varietyIds = speciesData.map((species) => species.varieties.map((variety) => {
        const match = variety.pokemon.url.match(/https\:\/\/pokeapi.co\/api\/v2\/pokemon\/(\d+)\//)
        return match ? parseInt(match[1]) : null
    })).flat().filter((id): id is number => id !== null)
    const varietyData = (await Promise.all(
        Array.from(new Set(varietyIds)).map(async (id) => {
            return await api.getPokemonById(id)
            .then((data) => data)
            .catch((error) => {
                console.error(error)
                return null
            })
        })
    )).filter((data: Pokemon | null): data is Pokemon => data !== null)
    return speciesData.map((species) => (
        {
            name: species.names.find((name) => name.language.name === "en")?.name ?? species.name,
            images: species.varieties
                .map((variety) => varietyData.find((pokemon) => pokemon.name === variety.pokemon.name))
                .filter((data): data is Pokemon => data !== undefined)
                .map((pokemon) => pokemon.sprites.other ? pokemon.sprites.other["official-artwork"].front_default : pokemon.sprites.front_default)
                .filter((url): url is string => url !== null)
        }
    ))
}

async function listPokemonSpeciesPage(page = 0, limit = 1000) {
    const results = await api.listPokemonSpecies(page * limit, limit)
    const ids = results.results.map((result) => {
        const match = result.url.match(/https\:\/\/pokeapi.co\/api\/v2\/pokemon\-species\/(\d+)\//)
        return match ? parseInt(match[1]) : null
    }).filter((id): id is number => id !== null)
    return {
        ids,
        hasNext: !!results.next,
    }
}

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