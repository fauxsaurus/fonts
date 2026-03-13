const GLYPHS = {
	A: {
		dots: '1',
		lines: [
			`M0,2048 v-2048 h512 q512,0,512,512 v${1024 + 512}`,
			`M0,1024 h1024`,
		],
	},
	B: {
		dots: '12',
		lines: [
			`M0,0 v2048 h512 q512,0,512,-512 q0,-512,-512,-512`,
			// `M0,0 v2048 h${1024 - 256} q256,0,256,-256 v-512 q0,-256,-256,-256 h-512`,
			// `M0,0 h${1024 - 256} q256,0,256,256 v512 q0,256,-256,256`,
			`M0,0 h512 q512,0,512,512 q0,512,-512,512 h-256`,
		],
	},
	C: {
		dots: '14',
		lines: [`M1024,0 h-1024 v${2048 - 512} q0,512,512,512 h512`],
	},
	D: {
		dots: '145',
		lines: [`M0,2048 v-2048 h512 q512,0,512,512 v1024 q0,512,-512,512z`], // diagonals
	},
	E: {
		dots: '15',
		lines: [
			`M1024,0 h-1024 v${2048 - 256} q0,256,256,256 h${1048 - 266}`,
			`M1024,1024 h-1024`,
		],
	},
	F: {
		dots: '124',
		lines: [`M1024,0 h-1024 v2048`, `M1024,1024 h-1024`],
	},
	G: {
		dots: '1245',
		lines: [
			// `M1024,512 v-512 h-1024 v${2048 - 512} q0,512,512,512 q512,0,512,-512 v-512 h-512`,
			`M1024,512 v-512 h-1024 v${2048 - 256} q0,256,256,256 h512 q256,0,256,-256 v-${512 + 256} h-512`,
		],
	},
	H: {
		dots: '125',
		lines: [`M0,0 v2048`, `M1024,0 v2048`, `M0,1024 h1024`],
	},
	I: {
		dots: '24',
		filled: '4',
		lines: [`M0,0 h1024`, `M0,2048 h1024`, `M512,0 v2048`],
	},
	J: {
		dots: '245',
		lines: [
			`M512,0 h512 v${2048 - 256} q0,256,-256,256 h-512 q-256,0,-256,-256 v-512`,
		],
	},
	K: {
		dots: '13',
		lines: [`M0,0 0,2048`, `M0,1024 1024,0`, `M0,1024 1024,2048`],
	},
	L: {
		dots: '123',
		lines: [`M0,0 v${2048 - 256} q0,256,256,256 h${512 + 256}`],
	},
	M: {
		dots: '134',
		lines: [
			`M0,2048 v-${2048 - 256} q0,-256,256,-256 h${1024 - 256} v2048`,
			`M512,0 v2048`,
		],
	},
	N: {
		dots: '1345',
		lines: [
			`M0,2048 v-2048 h256 q256,0,256,256 v${2048 - 512} q0,256,256,256 q256,0,256,-256 v-${2048 - 256}`,
		],
	},
	O: {
		dots: '135',
		// lines: [
		// 	`M0,2048 v-2048 h${512 + 256} q256,0,256,256 v${2048 - 512} q0,256,-256,256z`,
		// ],
		lines: [
			`M512,0 q512,0,512,512 v1024 q0,512,-512,512 q-512,0,-512,-512 v-1024 q0,-512,512,-512`,
		],
	},
	P: {
		dots: '1234',
		lines: [`M0,2048 v-2048 h512 q512,0,512,512 q0,512,-512,512 h-256`],
	},
	Q: {
		dots: '12345',
		lines: [
			`M0,2048 v-2048 h1024 v${2048 - 256} q0,256,-256,256 h-${1024 - 256}`,
			`M512,2048 v256 q0,256,256,256 h256`,
		],
	},
	R: {
		dots: '1235',
		lines: [
			`M0,2048 v-2048 h512 q512,0,512,512 v512 h-1024`,
			// `M512,1024 v${1024 - 256} q0,256,256,256 h256`,
			`M0,1024 1024,2048`,
		],
	},
	S: {
		dots: '234',
		lines: [
			`M1024,512 q0,-512,-512,-512 q-512,0,-512,512 q0,512,512,512 q512,0,512,512 q0,512,-512,512 q-512,0,-512,-512`,
		],
	},
	T: {dots: '2345', filled: '4', lines: [`M0,0 h1024`, `M512,0 v2048`]},
	U: {
		dots: '136',
		lines: [`M0,0 v2048 h1024 v-2048`],
	},
	V: {dots: '1236', lines: []},
	W: {
		dots: '2456',
		lines: [
			`M0,0 v${2048 - 256} q0,256,256,256 h${1024 - 256} v-2048`,
			`M512,0 v2048`,
		],
	},
	X: {dots: '1346', lines: []},
	Y: {dots: '13456', lines: []},
	Z: {dots: '1356', lines: []},
	'.': {
		dots: '256',
		filled: '33',
		lines: [],
	},
	// '{': {
	// 	lines: [
	// 		`M0,1024 h256 q256,0,256,256 v512 q0,256,256,256 h256`,
	// 		`M0,1024 h256 q256,0,256,-256 v-512 q0,-256,256,-256 h256`,
	// 	],
	// },
}

const DOT_COORDS = {
	'1': [0, 0],
	'2': [0, 1024],
	'3': [0, 2048],
	'4': [1024, 0],
	'5': [1024, 1024],
	'6': [1024, 2048],
}

const STROKE_WIDTH = 128

const GLYPH_HEIGHT = 2048
const GLYPH_UNIT = GLYPH_HEIGHT / 2 // 1024, used to create a 2x3 matrix
const GLYPH_WIDTH = GLYPH_UNIT + STROKE_WIDTH * 5

const uniqueCharsInString = (string: string) =>
	Array.from(new Set(string.split('')))

// @todo need to do something about rounded edges like K's diagonals, L's horizontal from being cut off on the right edge... (MAKE IT THE SAME WIDTH AS THE UNFILLED DOTS IN THE CORNERS--SEE "t"!)
export const Braille = ({children}: {children: string}) => {
	const width = GLYPH_WIDTH * children.length
	const height = GLYPH_HEIGHT

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			{...{
				width: width + 1024,
				height: height + 1024,
				viewBox: `-512 -512 ${width + 1024} ${height + 1024}`,
			}}
		>
			<defs>
				{uniqueCharsInString(children).map((char) => {
					const metadata =
						GLYPHS[char.toLocaleUpperCase() as keyof typeof GLYPHS]
					if (!metadata) return ''

					const {dots, filled} = Object.assign({filled: ''}, metadata)

					return (
						<mask key={`mask-${char}`} id={`mask-${char}`}>
							<rect
								x="-256"
								y="-256"
								width={2048 + 512}
								height={2048 + 1024}
								fill="#fff"
							/>
							{(dots + filled).split('').map((num, i) => (
								<circle
									key={`dot-${i}`}
									cx={
										DOT_COORDS[
											num as keyof typeof DOT_COORDS
										][0]
									}
									cy={
										DOT_COORDS[
											num as keyof typeof DOT_COORDS
										][1]
									}
									r={STROKE_WIDTH * 1.5}
									strokeWidth={STROKE_WIDTH / 1.25}
									{...(filled && filled.indexOf(num) === -1
										? {stroke: 'white', fill: 'black'}
										: {stroke: 'black', fill: 'white'})}
								/>
							))}
						</mask>
					)
				})}
			</defs>
			<g
				style={{
					fill: 'none',
					stroke: 'black',
					strokeWidth: STROKE_WIDTH * 2,
				}}
			>
				{children.split('').map((glyph, i) => {
					const metadata =
						GLYPHS[glyph.toLocaleUpperCase() as keyof typeof GLYPHS]
					if (!metadata) return ''

					const {dots, filled} = Object.assign({filled: ''}, metadata)

					return (
						<g
							key={`glyph-${i}`}
							mask={`url(#mask-${glyph})`}
							transform={`translate(${GLYPH_WIDTH * i}, 0)`}
						>
							{metadata.lines.map((d, i) => (
								<path
									key={`path-${i}`}
									{...{d}}
									strokeLinecap="round"
								/>
							))}

							{(dots + filled).split('').map((num, i) => (
								<circle
									key={`dot-${i}`}
									cx={
										DOT_COORDS[
											num as keyof typeof DOT_COORDS
										][0]
									}
									cy={
										DOT_COORDS[
											num as keyof typeof DOT_COORDS
										][1]
									}
									r={STROKE_WIDTH * 1.5}
									strokeWidth={STROKE_WIDTH / 1.25}
									{...(filled && filled.indexOf(num) === -1
										? {stroke: 'black', fill: 'none'}
										: {stroke: 'none', fill: 'black'})}
								/>
							))}
						</g>
					)
				})}
			</g>
		</svg>
	)
}
