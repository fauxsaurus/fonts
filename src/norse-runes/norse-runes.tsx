import * as glyphs from './glyphs'
import {pts2MaxX, type IPt} from './util'

type IProps = {
	children: string
	/** @note If true, individual glyph strokes will render with different colors to help visualize changes. */
	debug?: boolean
	kerning: number
	strokeWidth: number
}

const DEBUG_STYLES = `g[transform] path {
	fill: hsl(
		from plum
		calc(
			60 * (sibling-index() - 1)
		) s l
	);
	opacity: 0.75;
}
`

const GLYPH_STROKES = {
	...glyphs,

	':': glyphs.colon,
	' ': glyphs.space,
}

const calcLetterSpacings = (sw: number) => {
	const sw4 = sw / 4

	return {
		BC: -sw,
		be: sw4,
		he: sw4,
		ia: sw4,
		ho: sw4,
		os: sw4,
		nd: sw4,
		rs: -sw / 2,
	}
}

const pts2svg = (pts: IPt[]) => pts.map((pt) => pt.join(',')).join(' ')
const sum = (numbers: number[]) => numbers.reduce((a, b) => a + b, 0)

const Line = ({children, debug = false, kerning, strokeWidth: sw}: IProps) => {
	const letterSpacings = calcLetterSpacings(sw)

	const height = 2048 * 1.5


	const glyphWidths = children.split('').map((glyph) => {
		const strokeFn = GLYPH_STROKES?.[glyph]
		if (!strokeFn) return kerning

		return pts2MaxX(strokeFn(sw).flat())
	})

	const glyphGaps = children.split('').map((currentGlyph, i, glyphs) => {
		if (!i) return 0 // no prior glyph, zero additional spacing

		const prevGlyph = glyphs[i - 1]
		const glyphPair = prevGlyph + currentGlyph

		return letterSpacings[glyphPair] ?? sw
	})

	const width = sum(glyphWidths) + sum(glyphGaps)

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${width} ${height}`}
			{...{width, height}}
			style={{background: 'white'}}
		>
			{debug && <style>{DEBUG_STYLES}</style>}
			<g stroke="none">
				{children.split('').map((glyph, i) => {
					const strokeFn = GLYPH_STROKES?.[glyph]
					if (!strokeFn) return <></>

					const x =
						sum(glyphWidths.slice(0, i)) +
						sum(glyphGaps.slice(0, i + 1))

					return (
						<g
							transform={`translate(${x}, 0)`}
							key={`${glyph}-${i}`}
						>
							{strokeFn(sw).map((pts, i) => {
								return (
									<path
										key={`${glyph}-stroke-${i}`}
										d={`M${pts2svg(pts)}z`}
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

export const NorseRunes = ({children = ''}: {children: string}) => {
	return (
		<div style={{display: 'flex'}}>
			<Line kerning={512} strokeWidth={192}>
				{children}
			</Line>
		</div>
	)
}
