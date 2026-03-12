import * as glyphs from './glyphs'
import {n} from './glyphs'
import {gt, horizontal, tip, vertical} from './stroke-components'
import {
	mirrorPtsV,
	pts2MaxX,
	pts2MinY,
	translatePts,
	translatePtsX,
	translatePtsY,
	type IPt,
	type IPts,
} from './util'

const sw = 192 // stroke width
const sw2 = sw / 2 // offset width

const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

const pts2svg = (pts: IPt[]) => pts.map((pt) => pt.join(',')).join(' ')

const B = (sw: number): IPts[] => {
	const lobeLower = translatePtsX(sw / 2, gt(sw))

	const minY = pts2MinY(lobeLower)
	const lobeUpper = translatePtsY(-minY, lobeLower)

	return [vertical(sw), lobeLower, lobeUpper]
}

const C = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const tipTop = translatePts([1024, 0], tip(sw, 45))
	const tipBottom = translatePts([1024, 2048 - swD45 / 2], tip(sw, 135))

	return [
		[...tipTop.reverse(), [0, 1024], ...tipBottom.reverse(), [swD45, 1024]],
	]
}

const E = (sw: number): IPts[] => {
	const [CPts] = C(sw)

	return [CPts, horizontal(sw, pts2MaxX(CPts))]
}

const N = (sw: number): IPts[] => {
	const [nPts] = n(sw)
	const formerMinY = pts2MinY(nPts)

	const newPts: IPts = [
		...translatePtsY(-formerMinY, [nPts[0], nPts[1]]), // diagonal top
		...nPts.slice(2, 5), // tip right
		...translatePtsY(-formerMinY, [nPts[5], nPts[6]]), // diagonal bottom
		...nPts.slice(6), // tip left
	]

	return [newPts]
}

const G = (sw: number): IPts[] => {
	const CShape: IPts = [
		[1024, swD45],
		[1024, 0],

		[0, 1024],

		[1024, 2048],
		[1024, 2048 - swD45],

		[swD45, 1024],
	]

	const maxX = 1024

	const overHang: IPts = [
		[maxX - sw, sw],
		[maxX, sw],

		...translatePts([maxX - sw, 1024 - sw * 2], tip(sw, 180)),
	]

	const tipInnerMinX = swD45 + sw2 * 3
	const tipInner = translatePts(
		[tipInnerMinX - sw / 2, 1024 - sw2],
		tip(sw, 270)
	).reverse()
	// const tipInner = translatePts([tipInnerMinX, 1024 - sw2], tipW)

	const _Shape: IPts = [...tipInner, [maxX, 1024 + sw2], [maxX, 1024 - sw2]]

	const vertical: IPts = [
		[maxX - sw, 1024],
		[maxX, 1024],

		[maxX, 2048 - sw],
		[maxX - sw, 2048 - sw],
	]

	return [CShape, overHang, _Shape, vertical]
}

const P = (sw: number): IPts[] => {
	return [vertical(sw), translatePts([sw / 2, -1024 + sw / 2], gt(sw))]
}

const colon = (sw: number): IPts[] => {
	const dot = vertical(sw, sw * 2, 1024 - sw2 * 2)

	return [dot, mirrorPtsV(1024, dot)]
}

const GlyphStrokes = {
	...{B, C, E, G}, // ADFHIJKLM
	...{N, P}, // OQRSTUVWXYZ

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
