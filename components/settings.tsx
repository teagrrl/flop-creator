import { trainerClasses } from "@helpers/utilities"
import React, { useEffect, useState } from "react"

type SettingsProps = {
    savedSettings: SettingsData
    onChangeSettings?: Function,
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
                <div className="grid grid-cols-2 gap-4 flex-grow py-6">
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
                    </div>
                </div>
            </div>
        </div>
    )
}