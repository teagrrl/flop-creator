import React, { useState } from "react"

type SettingsProps = {
    defaultNames?: string,
    defaultBans?: number,
    defaultPicks?: number,
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
    player1: PlayerData,
    player2: PlayerData,
}

export default function Settings({ defaultNames, defaultBans, defaultPicks, onChangeSettings }: SettingsProps) {
    const [pokemonNames, setPokemonNames] = useState<string>(defaultNames ?? "")
    const [numBans, setNumBans] = useState<number>(defaultBans ?? 3)
    const [numPicks, setNumPicks] = useState<number>(defaultPicks ?? 9)
    const [p1Data, setP1Data] = useState<PlayerData>({ name: "Adam", color: "#9d67ad" })
    const [p2Data, setP2Data] = useState<PlayerData>({ name: "Val", color: "#85ab6c" })
    const [banColor, setBanColor] = useState<string>("#9f0b29")

    function onPastePokemonNames(event: React.ClipboardEvent<HTMLTextAreaElement>) {
        setPokemonNames(event.clipboardData.getData("text"))
        updateSettings()
    }

    function onChangePokemonNames(event: React.ChangeEvent<HTMLTextAreaElement>) {
        setPokemonNames(event.target.value)
        updateSettings()
    }

    function onChangeNumBans(event: React.ChangeEvent<HTMLInputElement>) {
        setNumBans(parseInt(event.target.value))
        updateSettings()
    }

    function onChangeNumPicks(event: React.ChangeEvent<HTMLInputElement>) {
        setNumPicks(parseInt(event.target.value))
        updateSettings()
    }

    function onChangeP1Name(event: React.ChangeEvent<HTMLInputElement>) {
        setP1Data({ name: event.target.value, color: p1Data.color })
    }

    function onChangeP1Color(event: React.ChangeEvent<HTMLInputElement>) {
        setP1Data({ name: p1Data.name, color: event.target.value })
    }

    function onChangeP2Name(event: React.ChangeEvent<HTMLInputElement>) {
        setP2Data({ name: event.target.value, color: p2Data.color })
    }

    function onChangeP2Color(event: React.ChangeEvent<HTMLInputElement>) {
        setP2Data({ name: p2Data.name, color: event.target.value })
    }

    function onChangeBanColor(event: React.ChangeEvent<HTMLInputElement>) {
        setBanColor(event.target.value)
    }

    function updateSettings() {
        if(onChangeSettings) {
            onChangeSettings({
                names: pokemonNames.split(/\r?\n/).map((name) => name.toLowerCase().trim()), 
                bans: numBans, 
                picks: numPicks,
                banColor: banColor,
                player1: p1Data,
                player2: p2Data,
            })
        }
    }

    return (
        <div className="h-full w-full flex justify-center bg-neutral-800">
            <div className="w-full max-w-3xl flex flex-col py-6 gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col p-4 gap-4 bg-neutral-900 rounded-md">
                        <h3 className="flex-grow text-2xl font-bold text-center">Player 1</h3>
                        <div className="flex flex-row gap-4">
                            <h3 className="flex-grow text-xl font-semibold">Name</h3>
                            <input className="px-4 py-2 rounded-md text-black" type="text" placeholder="Name of this player..." value={p1Data.name} onChange={onChangeP1Name} />
                        </div>
                        <div className="flex flex-row gap-4">
                            <h3 className="flex-grow text-xl font-semibold">Color</h3>
                            <input className="w-12 h-12 rounded-md text-black" type="color" value={p1Data.color} onChange={onChangeP1Color} />
                        </div>
                    </div>
                    <div className="flex flex-col p-4 gap-4 bg-neutral-900 rounded-md">
                        <h3 className="flex-grow text-2xl font-bold text-center">Player 2</h3>
                        <div className="flex flex-row gap-4">
                            <h3 className="flex-grow text-xl font-semibold">Name</h3>
                            <input className="px-4 py-2 rounded-md text-black" type="text" placeholder="Name of this player..." value={p2Data.name} onChange={onChangeP2Name} />
                        </div>
                        <div className="flex flex-row gap-4">
                            <h3 className="flex-grow text-xl font-semibold">Color</h3>
                            <input className="w-12 h-12 rounded-md text-black" type="color" value={p2Data.color} onChange={onChangeP2Color} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-row flex-grow">
                    <h3 className="flex-grow text-2xl font-bold">Draftable Pokemon</h3>
                    <textarea className="w-1/2 px-4 py-2 rounded-md text-black" placeholder="Names of all the Pokemon in the draft pool separated by new lines..." value={pokemonNames} onPaste={onPastePokemonNames} onChange={onChangePokemonNames} />
                </div>
                <div className="flex flex-row gap-4">
                    <h3 className="flex-grow text-2xl font-bold">Number of Bans</h3>
                    <input className="w-24 px-4 py-2 rounded-md text-black" type="number" placeholder="Number of bans..." value={numBans} onChange={onChangeNumBans} />
                </div>
                <div className="flex flex-row gap-4">
                    <h3 className="flex-grow text-2xl font-bold">Number of Picks</h3>
                    <input className="w-24 px-4 py-2 rounded-md text-black" type="number" placeholder="Number of picks..." value={numPicks} onChange={onChangeNumPicks} />
                </div>
            </div>
        </div>
    )
}