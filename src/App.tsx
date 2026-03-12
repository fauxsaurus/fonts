import './App.css'
import {Braille} from './braille'
import {NorseRunes} from './norse-runes'

function App() {
	return (
		<>
			<h1>Runic English (Metal)</h1>
			<NorseRunes key="subtitle">Embers of the Nephilim:</NorseRunes>
			<NorseRunes key="line-1">Ghost Girl</NorseRunes>
			<NorseRunes key="line-2">and the</NorseRunes>
			<NorseRunes key="line-3">Ghost Giant</NorseRunes>
			<NorseRunes key="line-4">BCPcgjkquw</NorseRunes>

			<Braille>Andrew R. H. Quinn</Braille>
			<Braille>ABCDEFGHIJKLMNOPQRSTUVWXYZ</Braille>
		</>
	)
}

export default App
