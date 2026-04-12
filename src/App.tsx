import './App.css'
import {Braille} from './braille'
import {NorseRunes} from './norse-runes'

function App() {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz'

	return (
		<>
			<div className="cover">
				<div className="text-title">
					<NorseRunes key="subtitle" fontSize={24}>
						Embers of the Nephilim:
					</NorseRunes>
					<NorseRunes key="line-1" fontSize={64}>
						Ghost Girl
					</NorseRunes>
					<NorseRunes key="line-2" fontSize={24}>
						and the
					</NorseRunes>
					<NorseRunes key="line-3" fontSize={64}>
						Ghost Giant
					</NorseRunes>
				</div>
				<div className="text-author">
					<Braille>Andrew R. H. Quinn</Braille>
				</div>
			</div>
			<NorseRunes key="preview" fontSize={64} debug>
				JTL
			</NorseRunes>
			<NorseRunes key="lower" fontSize={64}>
				{alphabet}
			</NorseRunes>
			<NorseRunes key="upper" fontSize={64}>
				{alphabet.toLocaleUpperCase()}
			</NorseRunes>
			<NorseRunes key="series-title" fontSize={64}>
				Embers of the Nephilim:
			</NorseRunes>
			<NorseRunes key="b1-title" fontSize={64}>
				Ghost Girl and the Ghost Giant
			</NorseRunes>
			<NorseRunes key="b2-title" fontSize={64}>
				Ghost Girl and Genie vs Jack and Jill Frost
			</NorseRunes>
			<NorseRunes key="b3-title" fontSize={64}>
				Ghost Girl and the Lab Rats
			</NorseRunes>
			<NorseRunes key="b5-title" fontSize={64}>
				Ghost Girl and the Final Power
			</NorseRunes>
			<Braille>{alphabet.toLocaleUpperCase() + '.'}</Braille>
		</>
	)
}

export default App
