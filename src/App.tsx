import './App.css'
import {Braille} from './braille'
import {NorseRunes} from './norse-runes'

function App() {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz'

	const fontSizeLarge = 64
	const fontSizeSmall = 36

	return (
		<>
			<div className="cover">
				<div
					className="text-title metallic"
					style={{'--space-width': `${fontSizeSmall / 4}px`}}
				>
					<div className="subtitle">
						<NorseRunes key="title-line-1" fontSize={fontSizeSmall}>
							Embers of the Nephilim:
						</NorseRunes>
					</div>
					<div key="title-line-2">
						<NorseRunes key="capital" fontSize={fontSizeLarge}>
							Ghost Girl
						</NorseRunes>
						<span className="space"></span>
						<NorseRunes key="article" fontSize={fontSizeSmall}>
							and
						</NorseRunes>
					</div>
					<div key="title-line-3">
						<NorseRunes key="article" fontSize={fontSizeSmall}>
							the
						</NorseRunes>
						{/* <span className="space"></span> */}
						<NorseRunes key="capital" fontSize={fontSizeLarge}>
							Ghost Giant
						</NorseRunes>
					</div>
				</div>
				<div className="text-author">
					<Braille>Andrew R. H. Quinn</Braille>
				</div>
			</div>
			<br />
			<NorseRunes key="preview" fontSize={64} debug>
				JTL
			</NorseRunes>
			<div></div>
			<NorseRunes key="unique glyphs" fontSize={64}>
				theiGsomrlanEbfNp:d
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
