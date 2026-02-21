import './App.css'
import {Braille} from './braille'
import {calcRuneCoords, Metal, STROKE_WIDTH} from './norse-runes/'
import {calcRuneCoords2} from './norse-runes/calc-rune-coords2'
import {Metal2} from './norse-runes/metal2'
import {SVGRunes} from './norse-runes/raw-svg'

function App() {
	return (
		<>
			<h1>Runic English (Metal)</h1>
			<Metal
			<SVGRunes>BCEGPbcdefilopt </SVGRunes>
			<Metal2
				config={{
					glyphCoords: calcRuneCoords2(STROKE_WIDTH),
					// try 135-140 after tying stroke width to coords in calcRuneCoords
					strokeWidth: STROKE_WIDTH,
				}}
			>
				and the Ghost Girl
			</Metal2>
			{/* <Metal
				config={{
					glyphCoords: calcRuneCoords(STROKE_WIDTH * 1.4),
					// try 135-140 after tying stroke width to coords in calcRuneCoords
					strokeWidth: STROKE_WIDTH * 1.4,
				}}
			></Metal> */}
			<Braille>Andrew R. H. Quinn</Braille>
			<Braille>ABCDEFGHIJKLMNOPQRSTUVWXYZ</Braille>
		</>
	)
}

export default App
