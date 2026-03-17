import './App.css'
import {Braille} from './braille'
import {NorseRunes} from './norse-runes'

function App() {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz'

	return (
		<>
			<div className="cover">
				<div className="text-title">
					<NorseRunes key="subtitle" fontSize={3}>
						Embers of the Nephilim:
					</NorseRunes>
					<NorseRunes key="line-1" fontSize={3.5}>
						Ghost Girl
					</NorseRunes>
					<NorseRunes key="line-2" fontSize={2}>
						and the
					</NorseRunes>
					<NorseRunes key="line-3" fontSize={3.5}>
						Ghost Giant
					</NorseRunes>
				</div>
				<div className="text-author">
					<Braille>Andrew R. H. Quinn</Braille>
				</div>
			</div>

			<NorseRunes key="new" fontSize={2}>
				{alphabet}
			</NorseRunes>
			<NorseRunes debug key="old" fontSize={2}>
				{alphabet.toLocaleUpperCase()}
			</NorseRunes>

			{/* <Braille>ABCDEFGHIJKLMNOPQRSTUVWXYZ</Braille> */}
		</>
	)
}

export default App
