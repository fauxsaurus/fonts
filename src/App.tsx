import './App.css'
import {Braille} from './braille'
import {SVGRunes} from './norse-runes'

function App() {
	return (
		<>
			<h1>Runic English (Metal)</h1>
			<SVGRunes key="subtitle">Embers of the Nephilim: </SVGRunes>
			<SVGRunes key="line-1">Ghost Girl</SVGRunes>
			<SVGRunes key="line-2">and the</SVGRunes>
			<SVGRunes key="line-3">Ghost Giant </SVGRunes>

			<Braille>Andrew R. H. Quinn</Braille>
			<Braille>ABCDEFGHIJKLMNOPQRSTUVWXYZ</Braille>
		</>
	)
}

export default App
