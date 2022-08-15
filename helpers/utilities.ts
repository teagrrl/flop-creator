export const apiFetcher = (url: string) => fetch(url)
    .then(async (response) => {
        const data = await response.json()
        if(!response.ok) {
            const error = data.error ?? response.status
            return Promise.reject(error)
        }
        return data
    })
    .catch((error) => error)

export const trainerClasses = [
    "Ace Trainer",
    "Actor",
    "Armoa Lady",
    "Artist",
    "Athlete",
    "Backpacker",
    "Baker",
    "Bandit",
    "Battle Legend",
    "Beauty",
    "Bellhop",
    "Biker",
    "Bird Keeper",
    "Bodybuilder",
    "Bug Catcher",
    "Bug Maniac",
    "Burglar",
    "Camper",
    "Celebrity",
    "Challenger",
    "Channeler",
    "Chef",
    "Clown",
    "Collector",
    "Comedian",
    "Cook",
    "Cute Maniac",
    "Cute Trainer",
    "Cyclist",
    "Dancer",
    "Delinquent",
    "Doctor",
    "Dragon Tamer",
    "Driver",
    "Engineer",
    "Executive",
    "Expert",
    "Firebreather",
    "Fisher",
    "Gardener",
    "Gentleman",
    "Guitarist",
    "Harlequin",
    "Hex Maniac",
    "High-Tech Maniac",
    "Hiker",
    "Hunter",
    "Idol",
    "Janitor",
    "Jogger",
    "Juggler",
    "Lady",
    "Magician",
    "Medium",
    "Musician",
    "Navigator",
    "Novice",
    "Painter",
    "Picnicker",
    "Pikachu Fan",
    "Poké Fan",
    "Poké Kid",
    "Poké Maniac",
    "Pokémon Breeder",
    "Pokémon Ranger",
    "Pokémon Trainer",
    "Preschooler",
    "Psychic",
    "Punk Rocker",
    "Rail Staff",
    "Rich Boy",
    "Rising Star",
    "Roller Skater",
    "Roughneck",
    "Ruin Maniac",
    "Sailor",
    "School Kid",
    "Scientist",
    "Shady Guy",
    "Street Thug",
    "Super Nerd",
    "Supertrainer",
    "Surfer",
    "Swimmer",
    "Tamer",
    "Teacher",
    "Team Aqua Grunt",
    "Team Flare Grunt",
    "Team Galactic Grunt",
    "Team Magma Grunt",
    "Team Rocket Grunt",
    "Team Plasma Grunt",
    "Team Skull Grunt",
    "Team Yell Grunt",
    "Tourist",
    "Triathlete",
    "Tuber",
    "Veteran",
    "Warden",
    "Youngster",
]

export function properName(str: string) {
    return str.split("-").map((split) => split[0].toUpperCase() + split.slice(1)).join(" ")
}

export function possessive(str: string) {
    return str + "'" + (str.endsWith("s") ? "" : "s")
}

export function hexToRGBA(color?: string, alpha?: number) {
    if(!color) return color
    if(color.startsWith("#")) {
        color = color.slice(1)
    }
    if(!alpha) { 
        alpha = 0.6
    } else if(alpha > 1) {
        alpha = 1
    } else if(alpha < 0) {
        alpha = 0
    }
    return `rgba(${parseInt(color.slice(0, 2), 16)}, ${parseInt(color.slice(2, 4), 16)}, ${parseInt(color.slice(4), 16)}, ${alpha})`
}

export function UndefinedFilter<T>() {
    return (obj: T | undefined): obj is T => obj !== undefined
}