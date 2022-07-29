import { Pokemon, PokemonSpecies, PokemonStat } from "pokenode-ts"

export class SpeciesModel {
    public readonly name: string
    public readonly canMegaEvolve: boolean
    public readonly canGigantamax: boolean
    public readonly data: PokemonModel[]

    public readonly raw: PokemonSpecies

    constructor(data: PokemonSpecies, varietyData: Pokemon[]) {
        this.name = data.name
        this.canMegaEvolve = data.varieties.filter((variety) => variety.pokemon.name.endsWith("-mega")).length > 0
        this.canGigantamax = data.varieties.filter((variety) => variety.pokemon.name.endsWith("-gmax")).length > 0
        this.data = varietyData.map((variety) => new PokemonModel(variety))

        this.raw = data
    }
}

export class PokemonModel {
    public readonly name: string
    public readonly types: string[]
    public readonly abilities: string[]
    public readonly stats: BaseStatsModel
    public readonly baseStatTotal: number
    public readonly height: number // in meters
    public readonly weight: number // in kilograms

    public readonly artwork: string | null
    public readonly sprite: string | null
    public readonly moves: string[]

    public readonly raw: Pokemon

    constructor(data: Pokemon) {
        this.name = data.name
        this.types = data.types.map((type) => type.type.name)
        this.abilities = data.abilities.map((ability) => ability.ability.name)
        this.stats = new BaseStatsModel(data.stats)
        this.baseStatTotal = this.stats.total()
        this.height = data.height / 10
        this.weight = data.weight / 10

        this.artwork = data.sprites.other["official-artwork"].front_default
        this.sprite = data.sprites.front_default
        this.moves = data.moves.map((move) => move.move.name).sort()

        this.raw = data
    }
}

export class BaseStatsModel {
    public readonly hp: number
    public readonly attack: number
    public readonly specialAttack: number
    public readonly defense: number
    public readonly specialDefense: number
    public readonly speed: number

    constructor(data: PokemonStat[]) {
        this.hp = data.find((stat) => stat.stat.name === "hp")?.base_stat ?? -1
        this.attack = data.find((stat) => stat.stat.name === "attack")?.base_stat ?? -1
        this.specialAttack = data.find((stat) => stat.stat.name === "special-attack")?.base_stat ?? -1
        this.defense = data.find((stat) => stat.stat.name === "defense")?.base_stat ?? -1
        this.specialDefense = data.find((stat) => stat.stat.name === "special-defense")?.base_stat ?? -1
        this.speed = data.find((stat) => stat.stat.name === "speed")?.base_stat ?? -1
    }

    total() {
        return this.hp + this.attack + this.specialAttack + this.defense + this.specialDefense + this.speed
    }
}

export function SpeciesComparator(direction?: "asc" | "desc") {
    return (species1: SpeciesModel, species2: SpeciesModel) => {
        let comparison = 0;
        const attribute1 = species1.name
        const attribute2 = species2.name
        if(attribute1 !== attribute2) {
            if (attribute1 > attribute2 || attribute1 === void 0) comparison = 1;
            if (attribute1 < attribute2 || attribute2 === void 0) comparison = -1;
        }
        comparison = attribute1 > attribute2 ? -1 : 1
        if(!direction || direction === "asc") {
            comparison *= -1
        }
        return comparison
    }
}