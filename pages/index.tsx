import PickBan from '@components/pickban'
import Settings, { SettingsData } from '@components/settings'
import Head from 'next/head'
import { useState } from 'react'

export default function IndexPage() {
	const [isSettingsExpanded, setIsSettingsExpanded] = useState<boolean>(true)
    const [settingsData, setSettingsData] = useState<SettingsData>({ names: [], bans: 3, picks: 9, banColor: "#ff0000", player1: { name: "Player 1", color: "#00ff00" }, player2: { name: "Player 2", color: "#0000ff" } })
	const [isPickBanExpanded, setIsPickBanExpanded] = useState<boolean>(!isSettingsExpanded)

	function openSettings() {
		setIsPickBanExpanded(false)
        setIsSettingsExpanded(true)
	}

	function openPickBan() {
		if(settingsData.names.length < (settingsData.bans + settingsData.picks) * 2) {
			alert("You have fewer Pokemon than you've elected to ban and draft!")
		} else {
			setIsSettingsExpanded(false)
			setIsPickBanExpanded(true)
		}
	}

	function updateSettings(data: SettingsData) {
		setSettingsData(data)
	}

	return (
		<div className="w-screen h-screen flex flex-col text-white overflow-hidden">
			<Head>
				<title>FLOP</title>
			</Head>
			<div className={`flex flex-col ${isSettingsExpanded ? "flex-grow" : ""}`}>
				<button className="w-full px-4 py-2 text-lg font-semibold bg-gray-900 hover:bg-gray-600" onClick={openSettings}>Settings</button>
				{isSettingsExpanded && <Settings defaultNames={settingsData.names.join("\r\n")} defaultBans={settingsData.bans} defaultPicks={settingsData.picks} onChangeSettings={updateSettings} />}
			</div>
			<div className={`flex flex-col ${isPickBanExpanded ? "flex-grow" : ""}`}>
				<button className="w-full px-4 py-2 text-lg font-semibold bg-gray-900 hover:bg-gray-600" onClick={openPickBan}>Pick/Ban</button>
				{isPickBanExpanded && <PickBan names={settingsData.names} bans={settingsData.bans} picks={settingsData.picks} player1={settingsData.player1} player2={settingsData.player2} banColor={settingsData.banColor} />}
			</div>
		</div>
	)
}