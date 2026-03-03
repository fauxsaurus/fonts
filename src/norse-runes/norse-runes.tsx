import {gt, lt, tip, verticalAscender2Base} from './stroke-components'
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

const areStrokesEqual = (pts1: IPts, pts2: IPts) =>
	console.log(pts2svg(pts1) === pts2svg(pts2))

// # STROKES

/** @deprecated (use `gt(sw)` instead) */
const bTriangle = (() => {
	const center: IPt = [sw, 1024] // where the outer diagonal meets the center line of the glyph vertically

	const bottomOuter: IPt = [sw2, 2048]

	const topOuter = translatePt([-sw2, -sw2], center)
	const topInner = translatePt([-sw2, swD45 - sw2], center)

	const bottomInner = translatePt([0, -swD45], bottomOuter)

	const centerOuter = lines2intersectionPt(bottomOuter, -1, topOuter, 1)

	const centerInner = lines2intersectionPt(topInner, 1, bottomInner, -1)

	return {
		topOuter,
		centerOuter,
		bottomOuter,
		bottomInner,
		centerInner,
		topInner,

		pts: [
			topOuter,
			centerOuter,
			bottomOuter,
			bottomInner,
			centerInner,
			topInner,
		] as IPt[],
	}
})()

/** @deprecated */
const cShape = (() => {
	const [topRight, centerOuter] = translatePts(
		[bTriangle.centerOuter[0], 0],
		mirrorPtsH(0, bTriangle.pts)
	)

	const originalTip: IPt[] = tip(sw)

	const centerInner = translatePt([sw * Math.SQRT2, 0], centerOuter)

	const [tipTopOuter, tipTop, tipTopInner] = translatePts(
		[topRight[0], topRight[1] - sw2],
		rotatePts(45, originalTip[0], originalTip)
	)

	const ltPts = lt(sw)

	const maxX = pts2MaxX(ltPts)
	const maxY = pts2MaxY(ltPts)
	const minY = pts2MinY(ltPts)

	// filter uncapped inner edge pts (so that nothing will be between the inner center point and the inner tip pts for the straightest possible line)
	const [topOuter, outerCenter, bottomOuter, innerCenter] = ltPts.filter(
		([x, y]) => x !== maxX || [minY, maxY].includes(y)
	)

	const [tipBottomOuter, tipBottom, tipBottomInner] = mirrorPtsV(
		2048,
		translatePts([0, 1024 + sw2], [tipTopOuter, tipTop, tipTopInner])
	)

	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const newPts = [
		outerCenter,

		topOuter,
		translatePt([swD45 / 2, 0], topOuter),
		translatePt([swD45 / 2, swD45 / 2], topOuter),

		innerCenter,

		translatePt([swD45 / 2, -swD45 / 2], bottomOuter),
		translatePt([swD45 / 2, 0], bottomOuter),
		bottomOuter,
	]

	return {
		centerOuter,

		tipTopOuter,
		tipTop,
		tipTopInner,

		centerInner,

		tipBottomInner,
		tipBottom,
		tipBottomOuter,

		pts: newPts,
	}
})()

// tips named after the cardinal directions in which they point

const tipN: IPts = [
	[0, 0],
	[sw2, -sw2],
	[sw, 0],
]

const tipNE: IPt[] = [
	[0, 0],
	[sw / Math.SQRT2, 0],
	[sw / Math.SQRT2, sw / Math.SQRT2],
]

const tipE: IPt[] = [
	[0, 0],
	[sw2, sw2],
	[0, sw],
]

const tipSE: IPt[] = [
	[0, 0],
	[sw / Math.SQRT2, 0],
	[sw / Math.SQRT2, -sw / Math.SQRT2],
]

const tipS: IPt[] = [
	[0, 0],
	[sw, 0],
	[sw2, sw2],
]

const tipW: IPt[] = mirrorPtsH(0, tipE)

const nShape = (() => {
	const verticalTipBottom = translatePts(
		[0, 2048 - sw2],
		mirrorPtsV(0, tipN)
	).reverse()

	const diagonalLOuter: IPt = [0, 1024 - sw2]
	const diagonalROuter: IPt = [1024, bTriangle.centerOuter[1]]

	const run = diagonalROuter[0] - diagonalLOuter[0]
	const rise = diagonalROuter[1] - diagonalLOuter[1]

	const diagonalAngle = (Math.atan2(run, rise) * 180) / Math.PI

	const w = distanceBetweenPts(diagonalLOuter, [
		1024,
		bTriangle.centerOuter[1],
	])

	// @todo Fix this horrendous math!
	const diagonal: IPts = rotatePts(diagonalAngle - 32.72, diagonalLOuter, [
		diagonalLOuter,
		[w, diagonalLOuter[1]],
		[w, diagonalLOuter[1] + sw],
		[diagonalLOuter[0] + sw, diagonalLOuter[1] + sw],
	])

	const lTip = translatePts([0, 2048 - sw2], tipS)

	const left: IPts = [
		[0, 1024 - sw2],
		lTip[0],
		lTip[2],
		lTip[1],
		[sw, 1024 + sw2],
	]

	const right: IPts = [
		[1024, bTriangle.centerOuter[1]],
		...translatePts([1024 - sw, 0], verticalTipBottom),
		[1024 - sw, bTriangle.centerOuter[1]],
	]

	const pts: IPts = [
		diagonal[0],
		diagonal[1],
		right[1],
		right[2],
		right[3],

		[
			1024 - sw,
			getBisectorYAtX(diagonal[0], diagonal[1], right[1], 1024 - sw),
		],
		[sw, getBisectorYAtX(left[1], diagonal[0], diagonal[1], sw)],

		left[3],
		left[2],
		left[1],
	]

	return {pts}
})()

const B = (sw: number): IPts[] => {
	const lobeLower = translatePtsX(sw / 2, gt(sw))

	const minY = pts2MinY(lobeLower)
	const lobeUpper = translatePtsY(-minY, lobeLower)

	return [verticalAscender2Base(sw), lobeLower, lobeUpper]
}

const C = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	return [
		[
			...translatePts([1024, 0], tipNE).reverse(),
			[0, 1024],
			...translatePts([1024, 2048], tipSE),
			[swD45, 1024],
		],
	]
}

const EDash = (sw: number): IPts =>
	translatePts([sw2, 1024 - sw2], tipW)
		.reverse()
		.concat(translatePts([1024 + sw / Math.SQRT2 - sw2, 1024 - sw2], tipE))

const E = (sw: number): IPts[] => [C(sw)[0], EDash(sw)]

const N = (sw: number): IPts[] => {
	const newPts: IPts = [
		...translatePts([0, -nShape.pts[0][1]], [nShape.pts[0], nShape.pts[1]]),
		...nShape.pts.slice(2, 5),
		...translatePts([0, -nShape.pts[0][1]], [nShape.pts[5], nShape.pts[6]]),
		...nShape.pts.slice(6),
	]

	return [newPts]
}

const b = (sw: number): IPts[] => [
	verticalAscender2Base(sw),
	translatePtsX(sw / 2, gt(sw)),
]

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

	/**
	 * @todo to simplify the blocks below, create a tip function to create a tip
	 * pointed in a given cardinal direction given an outermost pt
	 */
	const minX = pts2MinX(cPts)
	const tipLeft = cPts.find(([x]) => x === minX)! // outer center pt
	const tipLeftTop = translatePt([sw2, -sw2], tipLeft)
	const tipLeftBottom = translatePt([sw2, sw2], tipLeft)

	const maxX = pts2MaxX(cPts)
	const tipRightBottom = translatePt([maxX - sw, 0], tipLeftBottom)
	const tipRightTop = translatePt([maxX - sw, 0], tipLeftTop)
	const tipRight = translatePt([maxX, 0], tipLeft)

	const dash: IPt[] = [
		tipLeft,
		tipLeftTop,

		tipRightTop,
		tipRight,

		tipRightBottom,
		tipLeftBottom,
	]

	return [cPts, dash]
}

const f = (sw: number): IPts[] => {
	const verticalTipBottom = translatePts(
		[0, 2048 - sw2],
		mirrorPtsV(0, tipN)
	).reverse()

	const tailTip = translatePts(bTriangle.centerInner, tipNE)

	const tail: IPts = [
		...tailTip,
		verticalTipBottom[0],
		translatePt([-swD45 / 2, -swD45 / 2], verticalTipBottom[0]),
	]

	const horizontal = translatePts(
		[pts2MaxX(tailTip) - sw2, 1024 - sw2],
		tipE
	).concat([
		[0, 1024 + sw2],
		[0, 1024 - sw2],
	])

	return [verticalAscender2Base(sw), mirrorPtsV(1024, tail), horizontal]
}

const h = (sw: number): IPts[] => {
	return [verticalAscender2Base(sw), nShape.pts]
}

const m = (sw: number): IPts[] => {
	const centerTip = translatePts([512 - sw2, 2048 - sw2], tipS)

	const center: IPts = [
		[512 - sw2, 1024 + 256],
		[512 + sw2, 1024 + 256],

		centerTip[1],
		centerTip[2],
		centerTip[0],
	]

	return [n(sw)[0], center]
}

const n = (sw: number): IPts[] => {
	const verticalTipBottom = translatePts(
		[0, 2048 - sw2],
		mirrorPtsV(0, tipN)
	).reverse()

	const diagonalLOuter: IPt = [0, 1024 - sw2]
	const diagonalROuter: IPt = [1024, bTriangle.centerOuter[1]]

	const run = diagonalROuter[0] - diagonalLOuter[0]
	const rise = diagonalROuter[1] - diagonalLOuter[1]

	const diagonalAngle = (Math.atan2(run, rise) * 180) / Math.PI

	const w = distanceBetweenPts(diagonalLOuter, [
		1024,
		bTriangle.centerOuter[1],
	])

	// @todo Fix this horrendous math!
	const diagonal: IPts = rotatePts(diagonalAngle - 32.72, diagonalLOuter, [
		diagonalLOuter,
		[w, diagonalLOuter[1]],
		[w, diagonalLOuter[1] + sw],
		[diagonalLOuter[0] + sw, diagonalLOuter[1] + sw],
	])

	const lTip = translatePts([0, 2048 - sw2], tipS)

	const left: IPts = [
		[0, 1024 - sw2],
		lTip[0],
		lTip[2],
		lTip[1],
		[sw, 1024 + sw2],
	]

	const right: IPts = [
		[1024, bTriangle.centerOuter[1]],
		...translatePts([1024 - sw, 0], verticalTipBottom),
		[1024 - sw, bTriangle.centerOuter[1]],
	]

	const pts: IPts = [
		diagonal[0],
		diagonal[1],
		right[1],
		right[2],
		right[3],

		[
			1024 - sw,
			getBisectorYAtX(diagonal[0], diagonal[1], right[1], 1024 - sw),
		],
		[sw, getBisectorYAtX(left[1], diagonal[0], diagonal[1], sw)],

		left[3],
		left[2],
		left[1],
	]

	return [pts]
}

const o = (sw: number): IPts[] => {
	const triLeftPts = translatePts(
		[bTriangle.centerOuter[0], 0],
		mirrorPtsH(0, bTriangle.pts)
	)
	const triRightPts = translatePts(
		[bTriangle.centerOuter[0] - sw, 0],
		bTriangle.pts
	)

	return [triLeftPts, triRightPts]
}

const p = (sw: number): IPts[] => {
	const vertical = translatePts([0, 1024 - sw2], verticalAscender2Base(sw))
	const triangle = translatePts([0, 0], bTriangle.pts)

	return [vertical, triangle]
}

const i = (sw: number): IPts[] => {
	const verticalTipTop = translatePts([0, 1024], tipN)
	const verticalTipBottom = translatePts(
		[0, 2048 - sw2],
		mirrorPtsV(0, tipN)
	).reverse()

	const vertical = verticalTipTop.concat(verticalTipBottom)

	const dotTop = translatePts([0, 1024 - sw * 3], tipN)
	const dotBottom = translatePts(
		[0, 1024 - sw * 2],
		mirrorPtsV(0, tipN)
	).reverse()

	const dot = dotTop.concat(dotBottom)

	const tailTip = translatePts(bTriangle.centerInner, tipNE)

	const tail: IPts = [
		...tailTip,
		verticalTipBottom[0],
		translatePt([-swD45 / 2, -swD45 / 2], verticalTipBottom[0]),
	]

	return [dot, vertical, tail]
}

const k = (sw: number): IPts[] => {
	/** @todo simplify vertical by creating a vertical creator fn with min/max ys and center x? */
	const verticalTipTop = translatePts([0, 1024], tipN)
	const verticalTipBottom = translatePts(
		[0, 2048 - sw2],
		mirrorPtsV(0, tipN)
	).reverse()

	const vertical = verticalTipTop.concat(verticalTipBottom)

	return [vertical, c(sw)[0]]
}

const l = (sw: number): IPts[] => {
	const verticalTipBottom = translatePts(
		[0, 2048 - sw2],
		mirrorPtsV(0, tipN)
	).reverse()

	const tailTip = translatePts(bTriangle.centerInner, tipNE)

	const tail: IPts = [
		...tailTip,
		verticalTipBottom[0],
		translatePt([-swD45 / 2, -swD45 / 2], verticalTipBottom[0]),
	]
	return [verticalAscender2Base(sw), tail]
}
// @todo left off here (finish removing cShape--see c() and e() for how to go about it)
const r = (sw: number): IPts[] => {
	const verticalTipTop = translatePts([0, 1024], tipN)
	const verticalTipBottom = translatePts(
		[0, 2048 - sw2],
		mirrorPtsV(0, tipN)
	).reverse()

	const vertical = verticalTipTop.concat(verticalTipBottom)

	const diagonal: IPts = [
		cShape.centerOuter,

		cShape.tipTopOuter,
		cShape.tipTop,
		cShape.tipTopInner,

		translatePt([-swD45, swD45], cShape.centerInner),
	]

	return [vertical, diagonal]
}

const s = (sw: number): IPts[] => {
	const tipLeft = cShape.centerOuter
	const tipLeftTop = translatePt([sw2, -sw2], tipLeft)
	const tipLeftBottom = translatePt([sw2, sw2], tipLeft)

	const tipRightBottom = translatePt(
		[cShape.tipTop[0] - sw, 0],
		tipLeftBottom
	)
	const tipRightTop = translatePt([cShape.tipTop[0] - sw, 0], tipLeftTop)
	const tipRight = translatePt([cShape.tipTop[0], 0], tipLeft)

	const _Shape: IPt[] = [
		tipLeft,
		tipLeftTop,

		tipRightTop,
		tipRight,

		tipRightBottom,
		tipLeftBottom,
	]

	const diagonalUpper = cShape.pts.slice(0, -3)
	const diagonalLower = translatePts(
		[diagonalUpper[2][0], 0],
		mirrorPtsH(0, mirrorPtsV(diagonalUpper.slice(-1)[0][1], diagonalUpper))
	)

	return [diagonalUpper, _Shape, diagonalLower]
}

const t = (sw: number): IPts[] => {
	const verticalTipBottom = translatePts(
		[0, 2048 - sw2],
		mirrorPtsV(0, tipN)
	).reverse()

	const tailTip = translatePts(bTriangle.centerInner, tipNE)

	const tail: IPts = [
		...tailTip,
		verticalTipBottom[0],
		translatePt([-swD45 / 2, -swD45 / 2], verticalTipBottom[0]),
	]

	const horizontal = translatePts(
		[pts2MaxX(tailTip) - sw2, 1024 - sw2],
		tipE
	).concat([
		[0, 1024 + sw2],
		[0, 1024 - sw2],
	])
	return [verticalAscender2Base(sw), tail, horizontal]
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

	const overHangTip = translatePts([maxX - sw, 1024 - sw * 2], tipS)

	const overHang: IPts = [
		[maxX, sw],
		[maxX - sw, sw],

		overHangTip[0],
		overHangTip[2],
		overHangTip[1],
	]

	const tipInnerMinX = swD45 + sw2 * 3
	const tipInner = translatePts([tipInnerMinX, 1024 - sw2], tipW)

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
	return [
		verticalAscender2Base(sw),
		translatePts([sw / 2, -1024 + sw / 2], gt(sw)),
	]
}

const a = (sw: number): IPts[] => {
	const triLeftPts = translatePts(
		[bTriangle.centerOuter[0], 0],
		mirrorPtsH(0, bTriangle.pts)
	)
	const triRightPts = translatePts(
		[bTriangle.centerOuter[0] - sw, 0],
		bTriangle.pts
	)

	const width = Math.max(...triRightPts.map(([x]) => x))

	const verticalTipTop = translatePts([0, 1024], tipN)
	const verticalTipBottom = translatePts(
		[0, 2048 - sw2],
		mirrorPtsV(0, tipN)
	).reverse()

	const vertical = translatePts(
		[width - sw, 0],
		verticalTipTop.concat(verticalTipBottom)
	)

	return [triLeftPts, triRightPts, vertical]
}

const d = (sw: number): IPts[] => {
	const verticalPts = translatePts(
		[bTriangle.centerOuter[0] - sw, 0],
		verticalAscender2Base(sw)
	)

	const trianglePts = translatePts(
		[bTriangle.centerOuter[0], 0],
		mirrorPtsH(0, bTriangle.pts)
	)

	return [verticalPts, trianglePts]
}

const GlyphStrokes = {
	B,
	C,
	E,
	G,
	N,
	P,
	a,
	b,
	c,
	d,
	e,
	f,
	h,
	i,
	k,
	l,
	m,
	n,
	o,
	p,
	r,
	s,
	t,
	':': (sw: number): IPts[] => {
		const topDotUpperTip = translatePts([0, 1024 - sw * 3], tipN)
		const topDotLowerTip = translatePts(
			[0, 1024 - sw * 2],
			mirrorPtsV(0, tipN)
		).reverse()

		const dot = topDotUpperTip.concat(topDotLowerTip)

		return [dot, mirrorPtsV(1024, dot)]
	},
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
			<g stroke="none" fill="#000">
				{children.split('').map((glyph, i) => {
					const strokeFn = GlyphStrokes?.[glyph]
					if (!strokeFn) return <></>

					const x =
						sum(glyphWidths.slice(0, i)) +
						sum(glyphGaps.slice(0, i + 1))

					return (
						<g transform={`translate(${x}, 0)`}>
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
