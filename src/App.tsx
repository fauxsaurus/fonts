import './App.css'

const PATHS = {
	// uppercase
	A: ['0,0 0,4', '2,1 2,4', '0,0 2,1', '0,1 2,2'],
	B: ['0,0 0,4 2,3 0,2 2,1 0,0'],
	C: ['2,0 0,2 2,4'],
	D: ['0,0 0,4 2,2 0,0'],
	E: ['2,0 0,2 2,2 0,2 2,4'],
	F: ['0,4 0,2 2,0 0,2 0,1 1,0 0,1 0,0'],
	G: ['2,1 2,0 0,2 2,4 2,2 1,2'],
	H: ['0,0 0,4', '2,0 2,4', '0,1 2,1', '0,2 2,2'],
	I: ['0,1 1,0 1,4 2,3'],
	J: ['2,0 2,4 0,3'],
	K: ['0,0 0,4', '2,0 0,2 2,4'],
	L: ['0,0 0,4 2,3'],
	M: ['0,4 0,0 2,1 2,4', '1,0.5 1,4'],
	N: ['0,0 0,4', '2,0 2,4', '0,1 2,3'],
	O: ['1,0 2,2 1,4 0,2 1,0'],
	P: ['0,0 0,4', '0,0 2,1 0,2'],
	Q: ['1,0 2,2 1,4 0,2 1,0', '1,2 2,4'],
	R: ['0,0 0,4', '2,4 0,2 2,1 0,0'],
	S: ['1,0 0,1 1.5,2.5 .5,4'],
	T: ['0,1 1,0 2,1', '1,0 1,4'],
	U: ['0,0 0,4 2,3 2,0'],
	V: ['0,0 1,4 2,0'],
	W: ['0,0 0,4 2,3 2,0', '1,0 1,3.5'],
	X: ['0,0 2,4', '0,4 2,0'],
	Y: ['0,0 1,1 2,0', '1,1 1,4'],
	Z: ['0.5,0 1.5,1.5 0,2.5 1,4'],
	// lowercase
	a: ['2,2 2,3 1,2 0,3 1,4 2,3 2,4'],
	b: ['0,0 0,4 2,3 0,2'],
	c: ['2,2 0,3 2,4'],
	d: ['2,0 2,4 0,3 2,2'],
	e: ['2,2 0,3 2,3 0,3 2,4'],
	f: ['0,4 0,2 1,0.5 0,2 1.5,2'],
	g: ['2,3 1,2 0,3 1,4 2,3 2,5 1,6 0,5'],
	h: ['0,0 0,4', '0,2 2,3 2,4'],
	i: ['0,0 0,1', '0,2 0,4 1,3'],
	j: ['2,0 2,1', '2,2 2,5 1,6 0,5'],
	k: ['0,0 0,4 0,3 2,4 0,3 2,2'],
	l: ['0,0 0,4 1,3'],
	m: ['0,2 0,4', '1,2.5 1,4', '2,3 2,4', '0,2 2,3'],
	n: ['0,2 0,4', '0,2 2,3 2,4'],
	o: ['2,3 1,2 0,3 1,4 2,3'],
	p: ['0,4 2,3 0,2 0,6'],
	q: ['2,4 0,3 2,2 2,6'],
	r: ['0,1 0,4', '0,2 2,1'],
	s: ['2,2 0,3 2,3 0,4'],
	t: ['0,0 0,4 1,3', '0,2 1,2'],
	u: ['0,2 0,4 2,3 2,2'],
	v: ['0,2 1,4 2,2'],
	w: ['0,2 0,4 2,3 2,2', '1,3.5 1,2'],
	x: ['0,2 2,4', '0,4 2,2'],
	y: ['0,2 1,4', '0,6 2,2'],
	z: ['0,2 2,3 0,3 2,4'],
	// symbols
	'-': ['0,2 2,2'],
	':': ['0,0 0,1', '0,3 0,4'],
	'.': ['0,3 0,4'],
	_: ['0,4 2,4'],
	' ': ['0,4 2,4'],
}

const BASE = 100

const HEIGHT = BASE * 6
const WIDTH = BASE * 2

const GlyphPreview = ({children}: {children: string}) => {
	const charsCoords = children.split('').map((char) => {
		const rawStringLines = PATHS[char as keyof typeof PATHS]
		return rawStringLines.map((line) =>
			line.split(' ').map((pair) => {
				const [x, y] = pair.split(',').map((txt) => parseFloat(txt))
				return {x: x * BASE, y: y * BASE}
			})
		)
	})

	return (
		<div>
			{charsCoords.map((charCoords, i) => (
				<svg
					key={i}
					viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
					xmlns="http://www.w3.org/2000/svg"
					width={WIDTH}
					height={HEIGHT}
				>
					<g style={{fill: 'none', stroke: '#000', strokeWidth: 40}}>
						{charCoords.map((lineCoords, i) => {
							const svgCoords = lineCoords.map(
								({x, y}) => `${x},${y}`
							)

							return <path d={`M${svgCoords}`} key={i} />
						})}
					</g>
				</svg>
			))}
		</div>
	)
}

function App() {
	return (
		<>
			<h1>Runic English</h1>
			<GlyphPreview>{Object.keys(PATHS).join('')}</GlyphPreview>
			<GlyphPreview>Embers of the Nephilim:</GlyphPreview>
			<GlyphPreview>GHOST GIRL</GlyphPreview>
			<GlyphPreview>and the</GlyphPreview>
			<GlyphPreview>GHOST Giant</GlyphPreview>
			<GlyphPreview>Andrew R. H. Quinn</GlyphPreview>
		</>
	)
}

export default App
