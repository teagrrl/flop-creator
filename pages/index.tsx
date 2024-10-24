import { useCallback, useState } from 'react'
import Head from 'next/head'
import PickBan from '@components/pickban'
import Settings, { SettingsData } from '@components/settings'

const defaultSettings: SettingsData = {
	names: [], 
	bans: 3, 
	picks: 9, 
	banColor: "#9f0b29", 
	players: [
		{ 
			name: "Player 1", 
			color: "#9d67ad", 
		},
		{ 
			name: "Player 2", 
			color: "#85ab6c", 
		},
		/*{ 
			name: "Player 3", 
			color: "#336699", 
		},
		{ 
			name: "Player 4", 
			color: "#b00b69", 
		},*/
	],
	showMega: false,
	showGmax: false,
	allowRandom: true,
}

export default function IndexPage() {
	const [isSettingsExpanded, setIsSettingsExpanded] = useState<boolean>(true)
    const [settingsData, setSettingsData] = useState<SettingsData>(defaultSettings)
	const [isPickBanExpanded, setIsPickBanExpanded] = useState<boolean>(!isSettingsExpanded)

	const updateSettings = useCallback((data: SettingsData) => {
		setSettingsData(data)
	}, [])

	function openSettings() {
		setIsPickBanExpanded(false)
        setIsSettingsExpanded(true)
	}

	function openPickBan() {
		if(settingsData.names.length < (settingsData.bans + settingsData.picks) * settingsData.players.length) {
			alert("You have fewer Pokemon than you've elected to ban and draft!")
		} else {
			setIsSettingsExpanded(false)
			setIsPickBanExpanded(true)
		}
	}

	return (
		<div className="w-screen h-screen flex flex-col text-white overflow-hidden">
			<Head>
				<title>FLOP</title>
			</Head>
			<div className={`flex flex-col ${isSettingsExpanded ? "flex-grow overflow-auto" : ""}`}>
				{isSettingsExpanded 
					? <Settings savedSettings={settingsData} onChangeSettings={updateSettings} />
					: <button className="w-full px-4 py-2 text-lg font-semibold bg-gray-900 hover:bg-gray-600" onClick={openSettings}>Settings</button>
				}
			</div>
			<div className={`flex flex-col ${isPickBanExpanded ? "flex-grow overflow-auto" : ""}`}>
				{isPickBanExpanded 
					? <PickBan settings={settingsData} />
					: <button className="w-full px-4 py-2 text-lg font-semibold bg-gray-900 hover:bg-gray-600" onClick={openPickBan}>Pick/Ban</button>
				}
			</div>
		</div>
	)
}