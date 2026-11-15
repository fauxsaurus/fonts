import {GLYPH_HEIGHT, GLYPH_WIDTH, STROKE_WIDTH} from './constants'
import {character2metadata} from './glyphs'

const uniqueCharsInString = (string: string) =>
	Array.from(new Set(string.split('')))

type IProps = {cx: number; cy: number; stroke: string; fill: string}
const Dot = ({cx, cy, stroke, fill}: IProps) => (
	<circle
		{...{cx, cy, stroke, fill}}
		r={STROKE_WIDTH * 1.5}
		strokeWidth={STROKE_WIDTH / 1.25}
	/>
)

// @todo need to do something about rounded edges like K's diagonals, L's horizontal from being cut off on the right edge... (MAKE IT THE SAME WIDTH AS THE UNFILLED DOTS IN THE CORNERS--SEE "t"!)
export const Braille = ({
	children,
	color = 'black',
}: {
	children: string
	color?: string
}) => {
	const width = GLYPH_WIDTH * children.length
	const height = GLYPH_HEIGHT

	const viewBox = `-512 -512 ${width + 1024} ${height + 1024}`

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			data-font-face="braille"
			{...{width: width + 1024, height: height + 1024, viewBox}}
			style={{width: '100%'}}
		>
			<defs>
				{uniqueCharsInString(children).map((char) => {
					const {pips} = character2metadata(char)
					if (!Object.keys(pips).length) return ''

					return (
						<mask key={`mask-${char}`} id={`mask-${char}`}>
							<rect
								x="-256"
								y="-256"
								width={2048 + 512}
								height={2048 + 1024}
								fill="#fff"
							/>
							{Object.entries(pips).map(
								([pipNumber, [cx, cy, isFilled]]) => {
									const {stroke, fill} = isFilled
										? {stroke: 'white', fill: 'black'}
										: {stroke: 'black', fill: 'white'}

									return (
										<Dot
											key={`dot-${pipNumber}`}
											{...{cx, cy, stroke, fill}}
										/>
									)
								}
							)}
						</mask>
					)
				})}
			</defs>
			<g
				style={{
					fill: 'none',
					stroke: color,
					strokeLinecap: 'round',
					strokeWidth: STROKE_WIDTH * 2,
				}}
			>
				{children.split('').map((glyph, i) => {
					const {pips, lines} = character2metadata(glyph)
					if (!Object.keys(pips).length) return ''

					return (
						<g
							key={`glyph-${i}`}
							mask={`url(#mask-${glyph})`}
							transform={`translate(${GLYPH_WIDTH * i}, 0)`}
						>
							{lines.map((d, i) => (
								<path key={`path-${i}`} {...{d}} />
							))}

							{Object.entries(pips).map(
								([pipNumber, [cx, cy, isFilled]]) => {
									const {stroke, fill} = isFilled
										? {stroke: color, fill: 'none'}
										: {stroke: 'none', fill: color}

									return (
										<Dot
											key={`dot-${pipNumber}`}
											{...{cx, cy, stroke, fill}}
										/>
									)
								}
							)}
						</g>
					)
				})}
			</g>
		</svg>
	)
}
