import './App.css'
import {Braille} from './braille'
import {Glyph_Coords, Metal, STROKE_WIDTH} from './norse-runes/'

function App() {
	return (
		<>
			<h1>Runic English (Metal)</h1>
			<Metal
				config={{glyphCoords: Glyph_Coords, strokeWidth: STROKE_WIDTH}}
			></Metal>
			<Braille>Andrew R. H. Quinn</Braille>
			<Braille>ABCDEFGHIJKLMNOPQRSTUVWXYZ</Braille>
		</>
	)
}

export default App
