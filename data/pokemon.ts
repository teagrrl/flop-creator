import { Pokemon, PokemonSpecies, PokemonStat } from "pokenode-ts"

export const SHINY_RATE = 1 / 8192

export type SortType = "hp" | "attack" | "defense" | "specialAttack" | "specialDefense" | "speed" | "total" | "name" | "physicalBulk" | "specialBulk"

export type SortLabel = {
    label: string,
    type: SortType,
}

export const sortLabels: SortLabel[] = [
    {
        label: "Abc",
        type: "name",
    },
    {
        label: "BST",
        type: "total",
    },
    {
        label: "HP",
        type: "hp",
    },
    {
        label: "Atk",
        type: "attack",
    },
    {
        label: "Def",
        type: "defense",
    },
    {
        label: "SpAtk",
        type: "specialAttack",
    },
    {
        label: "SpDef",
        type: "specialDefense",
    },
    {
        label: "Spe",
        type: "speed",
    },
    /*{
        label: "PhBulk",
        type: "physicalBulk",
    },
    {
        label: "SpBulk",
        type: "specialBulk",
    },*/
]
export class SpeciesModel {
    public readonly name: string
    //public readonly canMegaEvolve: boolean
    //public readonly canGigantamax: boolean
    public readonly data: PokemonModel[]

    constructor(data: PokemonSpecies, varietyData: Pokemon[], isShiny?: boolean) {
        const speciesName = data.names.find((name) => name.language.name === "en")?.name ?? data.name
        this.name = speciesName
        //this.canMegaEvolve = data.varieties.filter((variety) => variety.pokemon.name.endsWith("-mega")).length > 0
        //this.canGigantamax = data.varieties.filter((variety) => variety.pokemon.name.endsWith("-gmax")).length > 0
        this.data = varietyData.map((variety) => new PokemonModel(variety, speciesName, isShiny))
    }
}

export class PokemonModel {
    public readonly species: string
    public readonly name: string
    public readonly types: string[]
    public readonly abilities: string[]
    public readonly stats: BaseStatsModel
    public readonly baseStatTotal: number
    public readonly height: number // in meters
    public readonly weight: number // in kilograms

    public readonly isShiny: boolean
    public readonly artwork: string | null
    public readonly sprite: string | null
    public readonly moves: string[]

    public readonly badges: string[]

    constructor(data: Pokemon, speciesName: string, isShiny?: boolean) {
        this.species = speciesName
        this.name = data.name
        this.types = data.types.map((type) => type.type.name)
        this.abilities = data.abilities.map((ability) => ability.ability.name)
        this.stats = new BaseStatsModel(data.stats)
        this.baseStatTotal = this.stats.total()
        this.height = data.height / 10
        this.weight = data.weight / 10

        this.isShiny = isShiny ?? false
        this.sprite = this.isShiny ? data.sprites.front_shiny : data.sprites.front_default
        this.artwork = data.sprites.other ? data.sprites.other["official-artwork"].front_default ?? (this.isShiny ? data.sprites.other.home.front_shiny : data.sprites.other.home.front_default) : this.sprite
        this.moves = data.moves.map((move) => move.move.name).sort()

        this.badges = this.tags()
    }

    tags() {
        const tags: string[] = []
        let adjustedPhysicalBulk = this.stats.physicalBulk * 17 / 16, // leftovers 
            adjustedSpecialBulk = this.stats.specialBulk * 17 / 16
        if(this.hasRecovery()) {
            if(adjustedPhysicalBulk > 2) adjustedPhysicalBulk *= 2
            if(adjustedSpecialBulk > 2) adjustedSpecialBulk *= 2
        }
        if(adjustedPhysicalBulk > 11.5) {
            tags.push("def5")
        } else if(adjustedPhysicalBulk > 5.5) {
            tags.push("def4")
        } else if(adjustedPhysicalBulk > 2.5) {
            tags.push("def3")
        }
        if(adjustedSpecialBulk > 15) {
            tags.push("spdef5")
        } else if(adjustedSpecialBulk > 7) {
            tags.push("spdef4")
        } else if(adjustedSpecialBulk > 3) {
            tags.push("spdef3")
        }
        if(this.canSetHazards()) {
            tags.push("hazards")
        }
        if(this.canRemoveHazards()) {
            tags.push("spinner")
        }
        return tags
    }

    hasRecovery() {
        const recoveryMoves = [
            "recover", "milk-drink", "soft-boiled", "slack-off", "heal-order", "roost", "wish",
            "synthesis", "moonlight", "morning-sun", "shore-up", "lunar-blessing", "strength-sap"
        ]
        return this.moves.filter((move) => recoveryMoves.includes(move)).length > 0
    }

    canSetHazards() {
        const hazardAbilities = ["toxic-debris"]
        const hazardMoves = ["spikes", "ceaseless-edge", "stealth-rock", "toxic-spikes", "sticky-web"]
        return this.abilities.filter((ability) => hazardAbilities.includes(ability)).length > 0 
            || this.moves.filter((move) => hazardMoves.includes(move)).length > 0
    }

    canRemoveHazards() {
        const removalMoves = ["rapid-spin", "mortal-spin", "defog", "tidy-up", "court-change"]
        return this.moves.filter((move) => removalMoves.includes(move)).length > 0
    }
}

export class BaseStatsModel {
    public readonly hp: number
    public readonly attack: number
    public readonly defense: number
    public readonly specialAttack: number
    public readonly specialDefense: number
    public readonly speed: number
    public readonly physicalBulk: number
    public readonly specialBulk: number

    constructor(data: PokemonStat[]) {
        this.hp = data.find((stat) => stat.stat.name === "hp")?.base_stat ?? -1
        this.attack = data.find((stat) => stat.stat.name === "attack")?.base_stat ?? -1
        this.defense = data.find((stat) => stat.stat.name === "defense")?.base_stat ?? -1
        this.specialAttack = data.find((stat) => stat.stat.name === "special-attack")?.base_stat ?? -1
        this.specialDefense = data.find((stat) => stat.stat.name === "special-defense")?.base_stat ?? -1
        this.speed = data.find((stat) => stat.stat.name === "speed")?.base_stat ?? -1
        this.physicalBulk = this.calculateBulk("physical")
        this.specialBulk = this.calculateBulk("special")
    }

    calculateBulk(type: "physical" | "special") {
        const maxHp = 2 * this.hp + 204
        let maxDef = 0
        let attackerAtk = 0
        if(type === "physical") {
            maxDef = this.defense
            attackerAtk = 100 * 359 // earthquake, jolly garchomp with 252 atk evs
        }
        if(type === "special") {
            maxDef = this.specialDefense
            attackerAtk = 80 * 369 // fiery dance, timid volcarona with 252 atk evs
        }
        maxDef = Math.floor((2 * maxDef + 99) * 1.1)
        const damageDealt = ((42 * attackerAtk / maxDef) / 50 + 2) * 1.5
        return maxHp / damageDealt
    }

    total() {
        return this.hp + this.attack + this.defense + this.specialAttack + this.specialDefense + this.speed
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

export function StatComparator(type: SortType) {
    return (model1: PokemonModel, model2: PokemonModel) => {
        const value1 = getStatValue(model1, type)
        const value2 = getStatValue(model2, type)
        if(typeof value1 === "number" && typeof value2 === "number") return value2 - value1
        if(value1 !== value2) {
            if (value1 > value2 || value1 === void 0) return 1
            if (value1 < value2 || value2 === void 0) return -1;
        }
        return value1 > value2 ? -1 : 1
    }
}

function getStatValue(model: PokemonModel, stat: SortType) {
    switch(stat) {
        case "hp":
            return model.stats.hp
        case "attack":
            return model.stats.attack
        case "defense":
            return model.stats.defense
        case "specialAttack":
            return model.stats.specialAttack
        case "specialDefense":
            return model.stats.specialDefense
        case "speed":
            return model.stats.speed
        case "total":
            return model.baseStatTotal
        case "name":
            return model.name
        case "physicalBulk":
            return model.stats.physicalBulk
        case "specialBulk":
            return model.stats.specialBulk
        // no default
    }
}

export function FormFilter(showMega?: boolean, showGmax?: boolean) {
    return (model: PokemonModel) => 
        true 
        && !(model.name.endsWith("-totem") || model.name.includes("-totem-")) // ignore totem pokemon 
        && !model.name.endsWith("-hisui") // ignore hisui pokemon until they are properly in a mainline game
        && !(!showMega && (model.name.endsWith("-mega") || model.name.includes("-mega-"))) // ignore mega-evolution with flag
        && !(!showGmax && model.name.endsWith("-gmax")) // ignore gigantamax with flag
}