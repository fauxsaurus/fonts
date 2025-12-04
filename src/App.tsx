import {
	line2triangularTipCoords,
	pts2glyphSegmentPts,
	type IPt,
} from './geometry'
import './App.css'

const PATHS = {
	// uppercase
	A: ['0,4 0,0 2,1 2,4', '0,1 2,2'],
	B: ['0,0 0,4 2,3 0,2 2,1 0,0'],
	// $: ['0,0 0,4', '0,1.5, 1.25,2.75 0,4', '0,0 1.25,1.25 0,2.5'],
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
	S: ['0,4 1.33,2.67 0,1.33 1.33,0'],
	T: ['0,1 1,0 2,1', '1,0 1,4'],
	U: ['0,0 0,4 2,3 2,0'],
	V: ['0,0 1,4 2,0'],
	W: ['0,0 0,4 2,3 2,0', '1,0 1,3.5'],
	X: ['0,0 2,4', '0,4 2,0'],
	Y: ['0,0 1,1 2,0', '1,1 1,4'],
	Z: ['1.33,4 0,2.67 1.33,1.33 0,0'],
	// lowercase
	a: ['2,2 2,3 1,2 0,3 1,4 2,3 2,4'],
	// $: ['1.25,4 0,2.75 1.25,1.5, 2.5,2.75 1.25,4', '2.5,1.5 2.5,4'],
	b: ['0,0 0,4', '0,1.5, 1.25,2.75 0,4'],
	c: ['1.25,4 0,2.75 1.25,1.5'],
	d: ['1.25,4 0,2.75 1.25,1.5', '1.25,0 1.25,4'],
	e: ['1.25,4 0,2.75 1.25,1.5', '0,2.75 1.25,2.75'],
	f: ['1,1 0,0 0,4', '0,2 1,2'],
	g: ['1.25,1.5 1.25,6 0,5', '1.25,4 0,2.75 1.25,1.5'],
	h: ['0,0 0,4', '0,2 2,3 2,4'],
	i: ['0,0 0,1', '0,2 0,4 1,3'],
	j: ['1,0 1,1', '1,2 1,6 0,5'],
	k: ['0,0 0,4', '1.25,4 0,2.75 1.25,1.5'],
	l: ['0,0 0,4 1,3'],
	m: ['0,2 0,4', '1,2.5 1,4', '2,3 2,4', '0,2 2,3'],
	n: ['0,2 0,4', '0,2 2,3 2,4'],
	o: ['2,3 1,2 0,3 1,4 2,3'],
	p: ['0,1.5 0,6', '0,1.5, 1.25,2.75 0,4'],
	q: ['1.25,1.5 1.25,6', '1.25,4 0,2.75 1.25,1.5'],
	r: ['0,1.5 0,4', '0,2.5 1,1.5'],
	s: ['1.25,1.5 0,2.75 1.25,2.75, 0,4'],
	t: ['0,0 0,4 1,3', '0,2 1,2'],
	u: ['0,2 0,4 2,3 2,2'],
	v: ['0,2 1,4 2,2'],
	w: ['0,2 0,4 2,3 2,2', '1,3.5 1,2'],
	x: ['0,2 2,4', '0,4 2,2'],
	y: ['1.75,1.5 1.75,6 0.5,5', '1.75,3.5 0,1.75'],
	z: ['0,1.5 1.25,2.75 0,2.75, 1.25,4'],
	// symbols
	'-': ['0,2 2,2'],
	':': ['0,0.25 0,1.25', '0,2.75 0,3.75'],
	'.': ['0,3 0,4'],
	_: ['0,4 2,4'],
	' ': ['0,4 2,4'],
}

const BASE = 100
const STROKE_WIDTH = 40

const HEIGHT = BASE * 6 + STROKE_WIDTH

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
			{charsCoords.map((charCoords, i) => {
				const allXs = charCoords.flat().map(({x}) => x).sort((a,b) => a - b) // prettier-ignore

				const minX = allXs[0]
				const maxX = allXs.slice(-1)[0]

				const width = maxX - minX + STROKE_WIDTH

				return (
					<svg
						key={i}
						viewBox={`0 0 ${width} ${HEIGHT}`}
						xmlns="http://www.w3.org/2000/svg"
						width={width}
						height={HEIGHT}
					>
						<g
							style={{
								fill: 'none',
								stroke: '#000',
								strokeWidth: STROKE_WIDTH,
							}}
						>
							{charCoords.map((lineCoords, i) => {
								const svgCoords = lineCoords.map(
									({x, y}) =>
										`${x + STROKE_WIDTH / 2},${
											y + STROKE_WIDTH / 2
										}`
								)

								return <path d={`M${svgCoords}`} key={i} />
							})}
						</g>
					</svg>
				)
			})}
		</div>
	)
}

const GlyphPreviewMetal = ({children}: {children: string}) => {
	const base = 250
	const strokeWidth = 100
	const height = base * 6 + strokeWidth

	const charsCoords = children.split('').map((char) => {
		const rawStringLines = PATHS[char as keyof typeof PATHS]
		return rawStringLines.map((line) =>
			line.split(' ').map((pair) => {
				const [x, y] = pair.split(',').map((txt) => parseFloat(txt))
				return {x: x * base, y: y * base}
			})
		)
	})

	return (
		<div>
			{charsCoords.map((charCoords, i) => {
				const allXs = charCoords.flat().map(({x}) => x).sort((a,b) => a - b) // prettier-ignore

				const minX = allXs[0]
				const maxX = allXs.slice(-1)[0]

				const width = maxX - minX + strokeWidth

				return (
					<svg
						key={i}
						viewBox={`0 0 ${width} ${height}`}
						xmlns="http://www.w3.org/2000/svg"
						width={width}
						height={height}
					>
						<g
							style={{
								fill: 'none',
								stroke: '#000',
								strokeWidth: strokeWidth,
							}}
							transform={`translate(${strokeWidth / 2},${
								strokeWidth / 2
							})`}
						>
							{charCoords.map((lineCoords, i) => {
								const glyphPts = pts2glyphSegmentPts(
									strokeWidth,
									lineCoords.map(({x, y}) => [x, y] as IPt)
								)

								const svgCoords = lineCoords.map(
									({x, y}) => `${x},${y}`
								)

								const [start0, start1] = lineCoords.slice(0, 2)
								const [end1, end0] = lineCoords.slice(-2)

								return (
									<>
										<path
											key={i}
											d={`M${svgCoords.join(' ')}`}
											// stroke-linejoin="bevel"
										/>
										<path
											key={`${i}-start-cap`}
											stroke="none"
											fill="red"
											d={
												'M' +
												line2triangularTipCoords(
													start0,
													start1,
													strokeWidth / 2
												)
													.map(
														(pt) =>
															`${pt.x},${pt.y}`
													)
													.join(' ') +
												'z'
											}
										/>
										<path
											key={`${i}-end-cap`}
											stroke="none"
											fill="lime"
											d={
												'M' +
												line2triangularTipCoords(
													end0,
													end1,
													strokeWidth / 2
												)
													.map(
														(pt) =>
															`${pt.x},${pt.y}`
													)
													.join(' ') +
												'z'
											}
										/>
										{glyphPts
											.flatMap(
												(
													derivative,
													i,
													derivatives
												) => {
													const rtn = []
													if (!i)
														rtn.push(
															derivative.prevPt
														)
													rtn.push(
														derivative.centerPt,
														...derivative.adjPts
													)

													if (
														derivatives.length -
															1 ===
														i
													)
														rtn.push(
															derivative.nextPt
														)

													return rtn
												}
											)
											.map(([cx, cy], i) => {
												return (
													<circle
														key={i}
														{...{cx, cy}}
														fill="#fc0"
														stroke="none"
														r={strokeWidth / 4}
													/>
												)
											})}
										{/* {svgCoords.map((coordPairStr, i) => {
											const [cx, cy] =
												coordPairStr.split(',')

											return (
												<circle
													key={i}
													{...{cx, cy}}
													fill="#fc0"
													stroke="none"
													r={strokeWidth / 4}
												/>
											)
										})} */}
									</>
								)
							})}
						</g>
					</svg>
				)
			})}
		</div>
	)
}

function App() {
	return (
		<>
			<h1>Runic English (Metal)</h1>
			<GlyphPreviewMetal>{Object.keys(PATHS).join('')}</GlyphPreviewMetal>
			<GlyphPreviewMetal>Embers of the Nephilim:</GlyphPreviewMetal>
			<GlyphPreviewMetal>Ghost Girl</GlyphPreviewMetal>
			<GlyphPreviewMetal>and the</GlyphPreviewMetal>
			<GlyphPreviewMetal>Ghost Giant</GlyphPreviewMetal>
			<GlyphPreviewMetal>Andrew R. H. Quinn</GlyphPreviewMetal>
			<h1>Runic English</h1>
			<GlyphPreview>{Object.keys(PATHS).join('')}</GlyphPreview>
			<GlyphPreview>Embers of the Nephilim:</GlyphPreview>
			<GlyphPreview>Ghost Girl</GlyphPreview>
			<GlyphPreview>and the</GlyphPreview>
			<GlyphPreview>Ghost Giant</GlyphPreview>
			<GlyphPreview>Andrew R. H. Quinn</GlyphPreview>
		</>
	)
}

export default App
