import * as glyphs from './glyphs'
import {vertical} from './stroke-components'
import {mirrorPtsV, pts2MaxX, type IPt, type IPts} from './util'

const sw = 192 // stroke width
const sw2 = sw / 2 // offset width

const pts2svg = (pts: IPt[]) => pts.map((pt) => pt.join(',')).join(' ')

const colon = (sw: number): IPts[] => {
	const dot = vertical(sw, sw * 2, 1024 - sw2 * 2)

	return [dot, mirrorPtsV(1024, dot)]
}

const GlyphStrokes = {
	...glyphs,

	':': colon,
	' ': (sw: number) => [
		[
			[1024, 0],
			[1024, 0],
		],
	],
}

const sw4 = sw / 4

const CUSTOM_SPACING = {
	BC: -sw,
	be: sw4,
	he: sw4,
	ia: sw4,
	ho: sw4,
	os: sw4,
	nd: sw4,
	rs: -sw / 2,
}

const Line = ({children, kerning}: {children: string; kerning: number}) => {
	const height = 2048 * 1.5

	const sum = (numbers: number[]) => numbers.reduce((a, b) => a + b, 0)

	const glyphWidths = children.split('').map((glyph) => {
		const strokeFn = GlyphStrokes?.[glyph]
		if (!strokeFn) return kerning

		return pts2MaxX(strokeFn(sw).flat())
	})

	const glyphGaps = children.split('').map((currentGlyph, i, glyphs) => {
		if (!i) return 0 // no prior glyph, zero additional spacing

		const prevGlyph = glyphs[i - 1]
		const glyphPair = prevGlyph + currentGlyph

		return CUSTOM_SPACING[glyphPair] ?? sw / 2
	})

	const width = sum(glyphWidths) + sum(glyphGaps)

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${width} ${height}`}
			{...{width, height}}
			style={{background: 'white'}}
		>
			<style>{`g[transform] path {
			fill: hsl(
				from plum
				calc(
					60 * (sibling-index() - 1)
				) s l
			);
			opacity: 0.75;
		}
		`}</style>
			<g stroke="none">
				{children.split('').map((glyph, i) => {
					const strokeFn = GlyphStrokes?.[glyph]
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
			<Line kerning={512}>{children}</Line>
		</div>
	)
}
