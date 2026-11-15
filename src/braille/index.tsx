import {
	DOT_COORDS,
	GLYPH_HEIGHT,
	GLYPH_WIDTH,
	GLYPHS,
	STROKE_WIDTH,
} from './constants'

const uniqueCharsInString = (string: string) =>
	Array.from(new Set(string.split('')))

type IProps = {cx: number; cy: number; stroke: string; fill: string}
const Dot = ({cx, cy, stroke, fill}: IProps) => {
	return (
		<circle
			{...{cx, cy, stroke, fill}}
			r={STROKE_WIDTH * 1.5}
			strokeWidth={STROKE_WIDTH / 1.25}
		/>
	)
}

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
			style={{width: '100%'}}
		>
			<defs>
				{uniqueCharsInString(children).map((char) => {
					const metadata =
						GLYPHS[char.toLocaleUpperCase() as keyof typeof GLYPHS]
					if (!metadata) return ''

					const {dots, filled, dotFix} = Object.assign(
						{
							filled: '',
							dotFix: {} as Record<number, [number, number]>,
						},
						metadata
					)

					return (
						<mask key={`mask-${char}`} id={`mask-${char}`}>
							<rect
								x="-256"
								y="-256"
								width={2048 + 512}
								height={2048 + 1024}
								fill="#fff"
							/>
							{(dots + filled).split('').map((num, i) => {
								const dotI = num as keyof typeof DOT_COORDS
								const coords = dotFix[dotI] ?? DOT_COORDS[dotI]
								const [cx, cy] = coords
								const isFilled =
									filled && filled.indexOf(num) === -1

								const {stroke, fill} = isFilled
									? {stroke: 'white', fill: 'black'}
									: {stroke: 'black', fill: 'white'}

								return (
									<Dot
										key={`dot-${i}`}
										{...{cx, cy, stroke, fill}}
									/>
								)
							})}
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

					const {dots, filled, dotFix} = Object.assign(
						{
							filled: '',
							dotFix: {} as Record<number, [number, number]>,
						},
						metadata
					)

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

							{(dots + filled).split('').map((num, i) => {
								const dotI = num as keyof typeof DOT_COORDS
								const coords = dotFix[dotI] ?? DOT_COORDS[dotI]
								const [cx, cy] = coords
								const isFilled =
									filled && filled.indexOf(num) === -1

								const {stroke, fill} = isFilled
									? {stroke: 'black', fill: 'none'}
									: {stroke: 'none', fill: 'black'}

								return (
									<Dot
										key={`dot-${i}`}
										{...{cx, cy, stroke, fill}}
									/>
								)
							})}
						</g>
					)
				})}
			</g>
		</svg>
	)
}
