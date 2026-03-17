import * as glyphs from './glyphs'
import {pts2MaxX, pts2MaxY, type IPt} from './util'

type IProps = {
	children: string
	/** @note If true, individual glyph strokes will render with different colors to help visualize changes. */
	debug?: boolean
	/** @note height of the <svg> element in rem units */
	fontSize: number
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
}

const calcLetterSpacings = (sw: number) => {
	const sw2 = sw / 2
	const sw4 = sw / 4

	const perpendicularDiagonals = sw4
	const nestedDiagonals = -sw

	return {
		BC: nestedDiagonals,
		be: perpendicularDiagonals,
		bc: perpendicularDiagonals,
		cd: nestedDiagonals,
		dj: sw * -0.75 /** @todo come up with a more exact figure */,
		fg: -sw,
		he: sw2,
		ho: sw2,
		ia: sw4,
		ij: -sw,
		no: sw2, // label as corner + vertical?
		op: sw2,
		os: sw2,
		pq: perpendicularDiagonals,
		nd: sw2,
		rs: -sw2,
	}
}

const pts2svg = (pts: IPt[]) => pts.map((pt) => pt.join(',')).join(' ')
const sum = (numbers: number[]) => numbers.reduce((a, b) => a + b, 0)

const Line = (props: IProps) => {
	const {children, debug = false, kerning, strokeWidth: sw} = props

	const letterSpacings = calcLetterSpacings(sw)

	const glyphs = children.trim().split('')

	const glyphWidths = glyphs.map((glyph) => {
		const strokeFn = GLYPH_STROKES?.[glyph]
		if (!strokeFn) return kerning

		return pts2MaxX(strokeFn(sw).flat())
	})

	const height = Math.max(
		...glyphs.map((glyph) => {
			const strokeFn = GLYPH_STROKES?.[glyph]
			if (!strokeFn) return kerning

			return pts2MaxY(strokeFn(sw).flat())
		})
	)

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
			style={{height: `${props.fontSize}rem`}}
		>
			{debug && <style>{DEBUG_STYLES}</style>}
			<g stroke="none">
				{glyphs.map((glyph, i) => {
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

export const NorseRunes = (props: {children: string; fontSize: number}) => {
	const {children = '', fontSize} = props

	return (
		<div style={{display: 'flex'}}>
			<Line kerning={192 * 2.5} strokeWidth={192} fontSize={fontSize}>
				{children}
			</Line>
		</div>
	)
}
