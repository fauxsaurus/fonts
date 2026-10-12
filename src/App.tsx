import './App.css'
import {Braille} from './braille'
import {Font} from './font'
import {NorseRunes} from './norse-runes'

function App() {
	const alphabet = 'abcdefghijklmnopqrstuvwxyz'

	const fontSizeLarge = 128 * 2
	const fontSizeSmall = 92 * 2

	return (
		<>
			<div className="cover">
				<div
					className="text-title metallic"
					style={{'--space-width': `${fontSizeSmall / 4}px`}}
				>
					<div className="subtitle">
						<NorseRunes
							key="title-line-1"
							fontSize={fontSizeSmall}
							depth={true}
						>
							Embers
							<Font
								size={fontSizeSmall * 0.8 ** 4}
							>{` of the `}</Font>
							Nephilim:
						</NorseRunes>
					</div>
					<div key="title-line-2">
						<NorseRunes
							key="capital"
							fontSize={fontSizeLarge}
							depth={true}
						>
							Ghost Girl
							<Font size={fontSizeSmall * 0.8}>{` and`}</Font>
						</NorseRunes>
					</div>
					<div key="title-line-3">
						<NorseRunes
							key="capital"
							fontSize={fontSizeLarge}
							depth={true}
						>
							<Font size={fontSizeSmall * 0.8}>{`the `}</Font>
							Ghost Giant
						</NorseRunes>
					</div>
				</div>

				<div className="text-author">
					<Braille>Andrew R. H. Quinn</Braille>
				</div>
			</div>
			<br />
			<NorseRunes key="preview" strokeWidth={64}>
				JTL
			</NorseRunes>
			<div></div>
			<NorseRunes key="unique glyphs" strokeWidth={64}>
				theiGsomrlanEbfNp:d
			</NorseRunes>
			<NorseRunes key="lower" strokeWidth={64}>
				{alphabet}
			</NorseRunes>
			<NorseRunes key="upper" strokeWidth={64}>
				{alphabet.toLocaleUpperCase()}
			</NorseRunes>
			<NorseRunes key="series-title" strokeWidth={64}>
				Embers of the Nephilim:
			</NorseRunes>
			<NorseRunes key="b1-title" strokeWidth={64}>
				Ghost Girl and the Ghost Giant
			</NorseRunes>
			<NorseRunes key="b2-title" strokeWidth={64}>
				Ghost Girl and Genie vs Jack and Jill Frost
			</NorseRunes>
			<NorseRunes key="b3-title" strokeWidth={64}>
				Ghost Girl and the Lab Rats
			</NorseRunes>
			<NorseRunes key="b5-title" strokeWidth={64}>
				Ghost Girl and the Final Power
			</NorseRunes>
			<Braille>{alphabet.toLocaleUpperCase() + '.'}</Braille>
		</>
	)
}

export default App
