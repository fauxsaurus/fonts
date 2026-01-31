import './App.css'
import {Glyph_Coords} from './glyph-coords'
import {Metal} from './metal'

function App() {
	return (
		<>
			<h1>Runic English (Metal)</h1>
			<Metal
				config={{glyphCoords: Glyph_Coords, strokeWidth: 204.8}}
			></Metal>
		</>
	)
}

export default App
