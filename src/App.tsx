import './App.css'
import {Braille} from './braille'
import {NorseRunes} from './norse-runes'

function App() {
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

			{/* <NorseRunes key="line-4">BCPcgjkquvwxyz</NorseRunes> */}

			{/* <Braille>ABCDEFGHIJKLMNOPQRSTUVWXYZ</Braille> */}
		</>
	)
}

export default App
