import {gt, lt, tip, vertical} from './stroke-components'
import {
	distanceBetweenPts,
	getBisectorYAtX,
	getYFromXOnLine,
	lines2intersectionPt,
	mirrorPtsH,
	mirrorPtsV,
	pt,
	pts2MaxX,
	pts2MaxY,
	pts2MinX,
	pts2MinY,
	rotatePts,
	translatePt,
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

const areStrokesEqual = (pts1: IPts, pts2: IPts) => {
	if (pts2svg(pts1) === pts2svg(pts2)) return console.log(true)

	console.log(false, pts1, pts2)
}

// # STROKES

const tail = (sw: number): IPts => {
	const tailTip = translatePts(
		gt(sw)[4], // inner center pt of ">"
		translatePtsX(sw / 2, tipNew(sw, 45))
	)

	// where tail meets the lower vertical tip
	const intersectionPt = pt(sw, 2048 - sw / 2)

	return [
		...tailTip,
		intersectionPt,
		translatePt([-swD45 / 2, -swD45 / 2], intersectionPt),
	]
}

const horizontal = (sw: number, w: number): IPts => {
	const sw2 = sw / 2
	const minY = 1024 - sw2

	const left = translatePts([0, minY], tipNew(sw, 270))
	const right = translatePts([w - sw2, minY], tipNew(sw, 90))

	return left.concat(right)
}

// @todo use this in `gt()` to simplify calculations?
const getLowercaseMidY = (sw: number) => c(sw)[0].find(([x]) => x === 0)![1]

/** @note remember, pt order can flip from left-to-right (ltr) to rtl (depending on degrees). */
const tipNew = (sw: number, degrees = 0): IPts => {
	const sw2 = sw / 2

	const pts: IPts = [[0, sw2], [sw2, 0], [sw, sw2]] // prettier-ignore
	if (!degrees) return pts

	const rotatedPts = rotatePts(degrees, [0, 0], pts)

	const minX = pts2MinX(rotatedPts)
	const minY = pts2MinY(rotatedPts)

	return translatePts([0 - minX, 0 - minY], rotatedPts)

	// @todo fix floating pt errors?
}

const B = (sw: number): IPts[] => {
	const lobeLower = translatePtsX(sw / 2, gt(sw))

	const minY = pts2MinY(lobeLower)
	const lobeUpper = translatePtsY(-minY, lobeLower)

	return [vertical(sw), lobeLower, lobeUpper]
}

const C = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const tipTop = translatePts([1024, 0], tipNew(sw, 45))
	const tipBottom = translatePts([1024, 2048 - swD45 / 2], tipNew(sw, 135))

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

const b = (sw: number): IPts[] => [vertical(sw), translatePtsX(sw / 2, gt(sw))]

const c = (sw: number): IPts[] => {
	const ltPts = lt(sw)

	const maxX = pts2MaxX(ltPts)
	const maxY = pts2MaxY(ltPts)
	const minY = pts2MinY(ltPts)

	/**
	 * @note 4 the straightest line possible, filter out uncapped inner edge pts
	 * so that nothing will be between the inner center pt and the inner tip pts
	 */
	const [topOuter, outerCenter, bottomOuter, innerCenter] = ltPts.filter(
		([x, y]) => x !== maxX || [minY, maxY].includes(y)
	)

	const sw2D45 = sw / Math.SQRT2 // half diagonal stroke width (@ 45 deg angle)

	const pts = [
		outerCenter,

		topOuter,
		translatePt([sw2D45, 0], topOuter),
		translatePt([sw2D45, sw2D45], topOuter),

		innerCenter,

		translatePt([sw2D45, -sw2D45], bottomOuter),
		translatePt([sw2D45, 0], bottomOuter),
		bottomOuter,
	]

	return [pts]
}

const e = (sw: number): IPts[] => {
	const [cPts] = c(sw)

	const centerY = getLowercaseMidY(sw)
	const maxX = pts2MaxX(cPts)
	const dash = translatePtsY(centerY - 1024, horizontal(sw, maxX))

	return [cPts, dash]
}

const f = (sw: number): IPts[] => {
	return t(sw).map((stroke) => mirrorPtsV(1024, stroke))
}

const h = (sw: number): IPts[] => [vertical(sw), n(sw)[0]]

const m = (sw: number): IPts[] => {
	const center: IPts = [
		[512 - sw2, 1024 + 256],
		[512 + sw2, 1024 + 256],

		...translatePts([512 - sw2, 2048 - sw2], tipNew(sw, 180)),
	]

	return [n(sw)[0], center]
}

const n = (sw: number): IPts[] => {
	// ptOrder = right-to-left
	const tipL = translatePtsY(2048 - sw / 2, tipNew(sw, 180))
	const tipR = translatePtsX(1024 - sw, tipL)

	const upperL = pt(0, 1024 - sw2)
	const upperR = pt(1024, getLowercaseMidY(sw))

	const run = upperR[0] - upperL[0]
	const rise = upperR[1] - upperL[1]

	const diagonalAngle = (Math.atan2(run, rise) * 180) / Math.PI

	// @todo Fix this horrendous math!
	const diagonal: IPts = rotatePts(diagonalAngle - 32.72, upperL, [
		upperL,
		[distanceBetweenPts(upperL, upperR), upperL[1]],
	])

	const pts: IPts = [
		diagonal[0],
		diagonal[1],

		...tipR,

		[
			1024 - sw,
			getBisectorYAtX(diagonal[0], diagonal[1], tipR[0], 1024 - sw),
		],
		[sw, getBisectorYAtX(tipL[2], diagonal[0], diagonal[1], sw)],

		...tipL,
	]

	return [pts]
}

/** @todo close up for a seamless shape  */
const o = (sw: number): IPts[] => {
	const ltPts = lt(sw)
	const centerX = pts2MaxX(ltPts)

	return [ltPts, translatePtsX(centerX, gt(sw))]
}

const p = (sw: number): IPts[] => {
	const sw2 = sw / 2

	const verticalMinY = 1024 - sw2
	const verticalMaxY = verticalMinY + 2048

	return [
		vertical(sw, verticalMinY, verticalMaxY),
		translatePtsX(sw2, gt(sw)),
	]
}

const i = (sw: number): IPts[] => {
	const dotMinY = 1024 - sw * 3.5
	const dotH = sw * 2

	const verticalMinY = 1024 - sw / 2

	return [
		vertical(sw, dotMinY, dotMinY + dotH),
		vertical(sw, verticalMinY),
		tail(sw),
	]
}

const k = (sw: number): IPts[] => {
	const [cPts] = c(sw)

	const minY = pts2MinY(cPts)
	const maxY = pts2MaxY(cPts)

	return [vertical(sw, minY, maxY), cPts]
}

const l = (sw: number): IPts[] => {
	return [vertical(sw), tail(sw)]
}

const r = (sw: number): IPts[] => {
	const [cPts] = c(sw)
	const diagonalEndPt = translatePt([0, swD45], cPts[0])
	const diagonalPts = cPts.slice(0, 4).concat([diagonalEndPt])

	return [vertical(sw, 1024 - sw / 2, 2048), diagonalPts]
}

const s = (sw: number): IPts[] => {
	const [cPts, _pts] = e(sw)

	const diagonalUpper = cPts.slice(0, -3)
	const lowerCaseMidline = diagonalUpper[0][1]

	const diagonalLower = translatePts(
		[diagonalUpper[2][0], 0],
		mirrorPtsH(0, mirrorPtsV(lowerCaseMidline, diagonalUpper))
	)

	return [diagonalUpper, diagonalLower, _pts]
}

const t = (sw: number): IPts[] => {
	const lPts = l(sw)

	return lPts.concat([horizontal(sw, pts2MaxX(lPts.flat()))])
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

		...translatePts([maxX - sw, 1024 - sw * 2], tipNew(sw, 180)),
	]

	const tipInnerMinX = swD45 + sw2 * 3
	const tipInner = translatePts(
		[tipInnerMinX - sw / 2, 1024 - sw2],
		tipNew(sw, 270)
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

const a = (sw: number): IPts[] => {
	const oPts = o(sw)
	const [_, gtPts] = oPts

	const maxX = pts2MaxX(gtPts)
	const minY = pts2MinY(gtPts)
	const maxY = pts2MaxY(gtPts)

	const verticalPts = translatePts([maxX - sw, 0], vertical(sw, minY, maxY))

	return oPts.concat([verticalPts])
}

const d = (sw: number): IPts[] => {
	const ltPts = lt(sw)

	const verticalPts = translatePtsX(pts2MaxX(ltPts) - sw / 2, vertical(sw))

	return [verticalPts, ltPts]
}

const colon = (sw: number): IPts[] => {
	const dot = vertical(sw, sw * 2, 1024 - sw2 * 2)

	return [dot, mirrorPtsV(1024, dot)]
}

const GlyphStrokes = {
	...{B, C, E, G, N, P},
	...{a, b, c, d, e, f},
	// g
	...{h, i, k, l, m, n, o, p},
	//q
	...{r, s, t},
	// u, v, w, x, y, z
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
