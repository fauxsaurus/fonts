import './App.css'
import {Braille} from './braille'
import {calcRuneCoords, Metal, STROKE_WIDTH} from './norse-runes/'

function App() {
	return (
		<>
			<h1>Runic English (Metal)</h1>
			<Metal
				config={{
					glyphCoords: calcRuneCoords(STROKE_WIDTH * 1.4),
					// try 135-140 after tying stroke width to coords in calcRuneCoords
					strokeWidth: STROKE_WIDTH * 1.4,
				}}
			></Metal>
			<Braille>Andrew R. H. Quinn</Braille>
			<Braille>ABCDEFGHIJKLMNOPQRSTUVWXYZ</Braille>
		</>
	)
}

export default App
