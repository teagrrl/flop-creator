import React, { useEffect, useState } from "react"
import { trainerClasses } from "@helpers/utilities"
import PopOverlay from "@components/popoverlay"

type SettingsProps = {
    savedSettings: SettingsData
    onChangeSettings?: (settings: SettingsData) => void,
}

export type PlayerData = {
    name: string,
    color: string,
}

export type SettingsData = {
    names: string[],
    bans: number,
    picks: number,
    banColor: string,
    players: PlayerData[],
    showMega: boolean,
    showGmax: boolean,
    allowRandom: boolean,
}

export default function Settings({ savedSettings, onChangeSettings }: SettingsProps) {
    const [pokemonNames, setPokemonNames] = useState<string>(savedSettings.names.join("\r\n"))
    const [numBans, setNumBans] = useState<number>(savedSettings.bans ?? 3)
    const [numPicks, setNumPicks] = useState<number>(savedSettings.picks ?? 9)
    const [playerData, setPlayerData] = useState<PlayerData[]>(savedSettings.players)
    const [banColor, setBanColor] = useState<string>(savedSettings.banColor)
    const [showMega, setShowMega] = useState<boolean>(savedSettings.showMega)
    const [showGmax, setShowGmax] = useState<boolean>(savedSettings.showGmax)
    const [allowRandom, setAllowRandom] = useState<boolean>(savedSettings.allowRandom)
    const [showFAQ, setShowFAQ] = useState<boolean>(false)

    useEffect(() => {
        if(onChangeSettings) {
            onChangeSettings({
                names: pokemonNames.split(/\r?\n/).map((name) => name.trim()).filter((name) => name.length > 0), 
                bans: numBans, 
                picks: numPicks,
                banColor: banColor,
                players: playerData,
                showMega: showMega,
                showGmax: showGmax,
                allowRandom: allowRandom,
            })
        }
    }, [onChangeSettings, pokemonNames, numBans, numPicks, playerData, banColor, showMega, showGmax, allowRandom,])

    function onChangePokemonNames(event: React.ChangeEvent<HTMLTextAreaElement>) {
        setPokemonNames(event.target.value)
    }

    function onChangeNumBans(event: React.ChangeEvent<HTMLInputElement>) {
        setNumBans(parseInt(event.target.value))
    }

    function onChangeNumPicks(event: React.ChangeEvent<HTMLInputElement>) {
        setNumPicks(parseInt(event.target.value))
    }

    function onChangePlayerData(event: React.ChangeEvent<HTMLInputElement>, type: "name" | "color", index: number) {
        updatePlayerData(index, type, event.target.value)
    }

    function onChangeBanColor(event: React.ChangeEvent<HTMLInputElement>) {
        setBanColor(event.target.value)
    }

    function onChangeShowMega(event: React.ChangeEvent<HTMLInputElement>) {
        setShowMega(event.target.checked)
    }

    function onChangeShowGmax(event: React.ChangeEvent<HTMLInputElement>) {
        setShowGmax(event.target.checked)
    }

    function onChangeAllowRandom(event: React.ChangeEvent<HTMLInputElement>) {
        setAllowRandom(event.target.checked)
    }

    function updatePlayerData(index: number, type: "name" | "color", value: string) {
        const updatedData = Array.from(playerData)
        updatedData[index][type] = value
        setPlayerData(updatedData)
    }

    function getRandomTrainerName(index: number) {
        const randomClass = trainerClasses[Math.floor(Math.random() * trainerClasses.length)]
        updatePlayerData(index, "name", randomClass)
    }

    return (
        <div className="h-full w-full flex justify-center bg-neutral-800 overflow-auto">
            <div className="w-full max-w-3xl flex flex-col first-letter:gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow px-4 md:px-0 py-6">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-2xl font-bold">Draftable Pokemon</h3>
                        <textarea className="flex-grow px-4 py-2 rounded-md resize-none text-black" placeholder="Names of all the Pokemon in the draft pool separated by new lines..." value={pokemonNames} onChange={onChangePokemonNames} />
                    </div>
                    <div className="flex flex-col gap-4">
                        {playerData.map((data, index) => 
                            <div key={`player_${index}`} className="flex flex-col p-4 gap-4 bg-neutral-900 rounded-md">
                                <h3 className="flex-grow text-2xl font-bold text-center">Player {index + 1}</h3>
                                <div className="flex flex-row gap-4 items-center">
                                    <h3 className="flex-grow text-xl font-semibold">Name</h3>
                                    <input className="w-40 px-4 py-2 rounded-md text-black" type="text" placeholder="Name of this player..." value={data.name} onChange={(e) => onChangePlayerData(e, "name", index)} />
                                    <button className="px-3 py-2 rounded-md text-black bg-white hover:bg-slate-200" onClick={() => getRandomTrainerName(index)}>🎲</button>
                                </div>
                                <div className="flex flex-row gap-4 items-center">
                                    <h3 className="flex-grow text-xl font-semibold">Color</h3>
                                    <input className="w-12 h-12 rounded-md text-black" type="color" value={data.color} onChange={(e) => onChangePlayerData(e, "color", index)} />
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col p-4 gap-4 bg-neutral-900 rounded-md">
                            <div className="flex flex-row gap-4 items-center">
                                <h3 className="flex-grow text-xl font-semibold">Number of Bans</h3>
                                <input className="w-24 px-4 py-2 rounded-md text-black" type="number" placeholder="Number of bans..." value={numBans} onChange={onChangeNumBans} />
                            </div>
                            <div className="flex flex-row gap-4 items-center">
                                <h3 className="flex-grow text-xl font-semibold">Ban Color</h3>
                                <input className="w-12 h-12 rounded-md text-black" type="color" value={banColor} onChange={onChangeBanColor} />
                            </div>
                        </div>
                        <div className="flex flex-col p-4 gap-4 bg-neutral-900 rounded-md">
                            <div className="flex flex-row gap-4 items-center">
                                <h3 className="flex-grow text-xl font-semibold">Number of Picks</h3>
                                <input className="w-24 px-4 py-2 rounded-md text-black" type="number" placeholder="Number of picks..." value={numPicks} onChange={onChangeNumPicks} />
                            </div>
                            <label className="flex flex-row gap-4 items-center">
                                <h3 className="flex-grow text-xl font-semibold">Show Mega-Evolutions</h3>
                                <input className="form-checkbox w-8 h-8 rounded-md" type="checkbox" checked={showMega} onChange={onChangeShowMega} />
                            </label>
                            <label className="flex flex-row gap-4 items-center">
                                <h3 className="flex-grow text-xl font-semibold">Show Gigantamax</h3>
                                <input className="form-checkbox w-8 h-8 rounded-md" type="checkbox" checked={showGmax} onChange={onChangeShowGmax}  />
                            </label>
                            <label className="flex flex-row gap-4 items-center">
                                <h3 className="flex-grow text-xl font-semibold">Allow Random</h3>
                                <input className="form-checkbox w-8 h-8 rounded-md" type="checkbox" checked={allowRandom} onChange={onChangeAllowRandom}  />
                            </label>
                        </div>
                        <div className="flex flex-row gap-2 items-center justify-end">
                            <button className="px-4 py-2 font-bold bg-neutral-900 hover:bg-neutral-700 rounded-md" title="What is FLOP?" onClick={() => setShowFAQ(true)}>?</button>
                        </div>
                    </div>
                </div>
            </div>
            {showFAQ && <PopOverlay className="w-[90vw] h-[90vh] md:w-[40vw] md:h-[60vh]">
                <div className="flex flex-col md:flex-row gap-4 p-4 py-6 overflow-auto bg-neutral-900 rounded-lg">
                    <div className="flex flex-row md:flex-col flex-wrap md:flex-nowrap gap-1 text-4xl font-bold">
                        <span>Friendly</span>
                        <span>Limited</span>
                        <span>OverUsed</span>
                        <span>Pokemon</span>
                        <div className="flex flex-grow justify-center items-end">
                            <button className="px-4 py-2 font-semibold text-base bg-neutral-700 hover:bg-neutral-600 rounded-md" onClick={() => setShowFAQ(false)}>Close</button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 text-lg">
                        <p><strong>FLOP</strong> is a (non-)competitive Pokémon format that my good friends ducks, vinone, TUИ, and valascano started playing because they were making lists of competitively terrible Pokémon that they wished to see in battle and the resulting games were fun enough to watch and play that we wanted to keep playing. One night, while we were staring at the janky Google Sheets pick and ban setup, someone joked, &ldquo;what if we had like one of those cool over-the-top esport graphics packages for this?&rdquo; and I thought, &ldquo;sure.&rdquo; So I proceded to spent far too many hours of my free time creating this website because I love my friends and their great ideas. Anyways, have fun and let me know if you encounter any bugs at <a className="underline" href="https://twitter.com/yoorilikeglass" target="_blank" rel="noreferrer">@yoorilikeglass</a> or <a className="underline" href="https://bsky.app/profile/yoori.space" target="_blank" rel="noreferrer">@yoori.space</a>.</p>
                        <p>This website is powered by <a className="underline" href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a> and <a className="underline" href="https://vercel.com/" target="_blank" rel="noreferrer">Vercel</a>.</p>
                    </div>
                </div>
            </PopOverlay>}
        </div>
    )
}