import './App.css'
import {Braille} from './braille'
import {Glyph_Coords, STROKE_WIDTH} from './glyph-coords'
import {Metal} from './metal'

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
