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
			<SVGRunes key="subtitle">Embers of the Nephilim: </SVGRunes>
			<SVGRunes key="line-1">Ghost Girl</SVGRunes>
			<SVGRunes key="line-2">and the</SVGRunes>
			<SVGRunes key="line-3">Ghost Giant </SVGRunes>
			<Metal2
				config={{
					glyphCoords: calcRuneCoords2(STROKE_WIDTH),
					// try 135-140 after tying stroke width to coords in calcRuneCoords
					strokeWidth: STROKE_WIDTH,
				}}
			>
				ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz:
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
