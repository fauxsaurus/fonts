import {l, m, n} from './glyphs-lowercase'
import {gt, horizontal, tail, tip, vertical} from './stroke-components'
import {
	getYFromXOnLine,
	mirrorPtsH,
	mirrorPtsV,
	pt,
	pts2MaxX,
	pts2MidX,
	pts2MidY,
	pts2MinX,
	pts2MinY,
	rotatePts,
	stretchStrokesUpward,
	translatePt,
	translatePts,
	translatePtsX,
	translatePtsY,
	type IPt,
	type IPts,
} from './util'

export const A = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const nStrokes = n(sw)

	const yThreshold = 2028 - sw / 2
	const minY = pts2MinY(nStrokes.flat())

	const nMaxX = pts2MaxX(nStrokes.flat())
	const mMaxX = pts2MaxX(m(sw).flat()) - sw / 2 // unsure why the offset adjustment is needed
	const offsetX = mMaxX - nMaxX

	const [NPts] = stretchStrokesUpward(yThreshold, -minY, nStrokes).map(
		(stroke) => {
			return stroke.map((pt) => {
				const [x, y] = pt

				if (x <= sw) return pt // don't move western pts
				if (y >= 2048 - sw / 2) return translatePtsX(offsetX, [pt])[0] // widen SE pts

				// outer NE edge of the upper diagonal
				if (x === nMaxX)
					return [mMaxX, getYFromXOnLine(pt, 1, mMaxX)] as IPt

				// inner NE corner of the bottom of the upper diagonal
				return [mMaxX - sw, getYFromXOnLine(pt, 1, mMaxX - sw)] as IPt
			})
		}
	)

	const midDiagonal = NPts.flatMap((pt) => {
		if (pt[1] >= yThreshold) return [] // drop lower tips

		return translatePtsY(swD45 * 2, [pt])
	})

	return [NPts, midDiagonal]
}

export const B = (sw: number): IPts[] => {
	const lobeLower = translatePtsX(sw / 2, gt(sw))

	const minY = pts2MinY(lobeLower)
	const lobeUpper = translatePtsY(-minY, lobeLower)

	return [vertical(sw), lobeLower, lobeUpper]
}

export const C = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const tipTop = translatePts([1024, 0], tip(sw, 45))
	const tipBottom = translatePts([1024, 2048 - swD45 / 2], tip(sw, 135))

	return [
		[...tipTop.reverse(), [0, 1024], ...tipBottom.reverse(), [swD45, 1024]],
	]
}

/** @todo should this be based off the more angular G outline? */
export const D = (sw: number): IPts[] => {
	const [CPts] = C(sw)
	const midX = pts2MidX(CPts)

	const verticalPts = vertical(sw, 0, 2048)

	return [verticalPts, mirrorPtsH(midX, CPts)]
}

export const E = (sw: number): IPts[] => {
	const [CPts] = C(sw)

	return [CPts, horizontal(sw, pts2MaxX(CPts))]
}

export const G = (sw: number): IPts[] => {
	const sw2 = sw / 2 // offset width
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

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

export const H = (sw: number): IPts[] => {
	const [left, _diagonal, right] = N(sw)

	const width = pts2MaxX(right)
	const middle = horizontal(sw, width)

	return [
		translatePtsX(sw / 2, left),
		translatePtsX(-sw / 2, right),
		translatePtsY(-sw, middle),
		translatePtsY(sw, middle),
	]
}

export const I = (sw: number): IPts[] => {
	const [verticalPts, tail] = l(sw)

	const tailUpper = mirrorPtsV(1024, tail)
	const tailLower = mirrorPtsH(sw / 2, tail)

	const minX = pts2MinX(tailLower)

	return [verticalPts, tailLower, tailUpper].map((stroke) =>
		translatePtsX(-minX, stroke)
	)
}
export const J = (sw: number): IPts[] => {
	const LPts = L(sw)
	const midX = pts2MidX(LPts.flat())

	return LPts.map((stroke) => mirrorPtsH(midX, stroke))
}

export const K = (sw: number): IPts[] => {
	return [...C(sw), translatePtsX(sw / 2, vertical(sw, 0, 2048))]
}
export const L = (sw: number): IPts[] => {
	return [vertical(sw, 0, 2048), tail(sw, 1.25)]
}

export const M = (sw: number): IPts[] => {
	const mStrokes = m(sw)

	const yThreshold = 2028 - sw / 2
	const minY = pts2MinY(mStrokes.flat())

	return stretchStrokesUpward(yThreshold, -minY, mStrokes)
}

export const N = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const mStrokes = m(sw)
	const width = pts2MaxX(mStrokes.flat())

	const left = vertical(sw, 0, 2048)
	const right = translatePtsX(width - sw, left)

	const gap = width - sw - sw

	// diagonal pts
	const diagonalNWpt = pt(sw, 0)
	const diagonalNEpt = translatePt([gap, gap], diagonalNWpt)

	const diagonalSWpt = translatePtsY(swD45, [diagonalNWpt])[0]
	const diagonalSEpt = translatePtsY(swD45, [diagonalNEpt])[0]

	const diagonal: IPts = [
		diagonalNWpt,
		diagonalNEpt,
		diagonalSEpt,
		diagonalSWpt,
	]

	const halfDiagonalHeight = gap / 2

	return [
		left,
		translatePtsY(1024 - halfDiagonalHeight - swD45 / 2, diagonal),
		right,
	]
}

export const O = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const cornerNOuter = pt(1024, 0)
	const cornerNInner = pt(1024, swD45)

	const cornerSOuter = pt(1024, 2048)
	const cornerSInner = pt(1024, 2048 - swD45)

	const cornerWOuter = pt(0, 1024)
	const cornerWInner = pt(swD45, 1024)

	const cornerEOuter = pt(2048, 1024)
	const cornerEInner = pt(2048 - swD45, 1024)

	return [
		[
			cornerNInner,
			cornerNOuter,

			cornerWOuter,

			cornerSOuter,

			cornerEOuter,

			cornerNOuter,
			cornerNInner,

			cornerEInner,

			cornerSInner,

			cornerWInner,
		],
	]
}

export const P = (sw: number): IPts[] => {
	return [vertical(sw), translatePts([sw / 2, -1024 + sw / 2], gt(sw))]
}

export const Q = (sw: number): IPts[] => {
	const tipSE = translatePts([2048 - sw, 2048 - sw], tip(sw, 135))
	const tipNW = translatePts([1024, 1024], tip(sw, -45))

	return [...O(sw), tipNW.concat(tipSE)]
}
export const T = (sw: number): IPts[] => {
	const right = tail(sw, 1.25)

	const left = mirrorPtsH(sw / 2, right)

	const minX = pts2MidX(left)

	return [vertical(sw, 0, 2048), left, right].map((stroke) =>
		mirrorPtsV(1024, translatePtsX(minX, stroke))
	)
}

export const U = (sw: number): IPts[] => {
	const [NShape] = A(sw)

	const midX = pts2MidX(NShape)

	return [mirrorPtsH(midX, mirrorPtsV(1024, NShape))]
}

// use this shape for a capital?
// /** @todo this could be simplified by making "m" a single path */
// export const w = (sw: number): IPts[] => {
// 	const mirroredMPts = m(sw).map((stroke) =>
// 		mirrorPtsH(512, mirrorPtsV(2048, stroke))
// 	)

// 	const maxY = pts2MaxY(mirroredMPts.flat())

// 	return mirroredMPts.map((stroke) => translatePtsY(2048 - maxY, stroke))
// }

export const Y = (sw: number): IPts[] => {
	const [verticalPts, leftPts, rightPts] = T(sw)

	const midY = pts2MidY(leftPts)

	return [verticalPts, mirrorPtsV(midY, leftPts), mirrorPtsV(midY, rightPts)]
}
