import {f, l, n, o} from './glyphs-lowercase'
import {gt, horizontal, tail, tip, vertical} from './stroke-components'
import {
	avgPts,
	getYFromXOnLine,
	lines2intersectionPt,
	mirrorPtsH,
	mirrorPtsHOnCenter,
	mirrorPtsV,
	mirrorPtsVOnCenter,
	pt,
	pts2MaxX,
	pts2MaxY,
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
import {m as mFlat} from './glyphs-lowercase-flat'

export const A = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const nStrokes = n(sw)

	const yThreshold = 2028 - sw / 2
	const minY = pts2MinY(nStrokes.flat())

	const nMaxX = pts2MaxX(nStrokes.flat())
	const mMaxX = pts2MaxX(mFlat(sw).flat()) - sw / 2 // unsure why the offset adjustment is needed
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

export const C_old = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const tipTop = translatePts([1024, 0], tip(sw, 45))
	const tipBottom = translatePts([1024, 2048 - swD45 / 2], tip(sw, 135))

	return [
		[...tipTop.reverse(), [0, 1024], ...tipBottom.reverse(), [swD45, 1024]],
	]
}

const CBasedGlyphSlope = (sw: number) => {
	const oPts = o(sw)
	const width = pts2MidX(oPts.flat()) + sw * 0.5

	return -1024 / width
}

const CGeometry = (sw: number) => {
	const oPts = o(sw)
	const width = pts2MidX(oPts.flat()) + sw * 0.5

	const slope = 1024 / width
	const cos = 1 / Math.sqrt(1 + slope ** 2)
	const verticalCrossSection = sw / cos

	const outerCenter = pt(0, 1024)

	const innerCenterY = 1024
	const innerCenterX =
		(innerCenterY - (2048 - verticalCrossSection)) / slope + width
	const innerCenter = pt(innerCenterX, outerCenter[1])

	const horizontalCrossSection = innerCenterX / 2

	const middleCenter = pt(innerCenterX / 2, 1024)

	const outerTop = pt(width, 0)
	const middleTop = pt(width + horizontalCrossSection, 0)
	const innerTop = pt(
		width + horizontalCrossSection,
		verticalCrossSection / 2
	)

	const [outerBottom, middleBottom, innerBottom] = mirrorPtsV(1024, [
		outerTop,
		middleTop,
		innerTop,
	])

	return {
		outerTop,
		middleTop,
		innerTop,
		topInset: pt(outerTop[0], innerTop[1]),

		outerCenter,
		middleCenter,
		innerCenter,

		innerBottom,
		middleBottom,
		outerBottom,
		bottomInset: pt(outerBottom[0], innerBottom[1]),
	}
}

export const C = (sw: number): IPts[] => {
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

	const underHang = mirrorPtsV(1024, overHang)

	return [CShape, overHang, underHang]
}

/** @todo should this be based off the more angular G outline? */
export const D = (sw: number): IPts[] => {
	const [CPts] = C(sw)
	const midX = pts2MidX(CPts)

	const verticalPts = vertical(sw, sw, 2048 - sw)

	return [verticalPts, mirrorPtsH(midX, CPts)]
}

const dot = (sw, pt: IPt): IPts => {
	const sw4 = sw / 4

	return [
		translatePts([-sw4, -sw4], [pt])[0],
		translatePts([sw4, -sw4], [pt])[0],
		translatePts([sw4, sw4], [pt])[0],
		translatePts([-sw4, sw4], [pt])[0],
	]
}

export const E = (sw: number): IPts[] => {
	const oPts = o(sw)
	const width = pts2MidX(oPts.flat()) + sw * 0.5

	const {
		outerTop,
		middleTop,
		innerTop,
		topInset,

		outerCenter,
		middleCenter,
		innerCenter,

		innerBottom,
		middleBottom,
		outerBottom,
		bottomInset,
	} = CGeometry(sw)

	const slope = 1024 / width
	const cos = 1 / Math.sqrt(1 + slope ** 2)
	const verticalCrossSection = sw / cos

	const innerCenterY = 1024
	const innerCenterX =
		(innerCenterY - (2048 - verticalCrossSection)) / slope + width

	const horizontalCrossSection = innerCenterX / 2

	const rightTip = pt(width + sw, 1024)
	const rightTipLeft = pt(width + sw / 2, 1024 - sw / 2)
	const rightTipRight = pt(width + sw / 2, 1024 + sw / 2)
	const rightTipInset = pt(width, 1024)

	const upperLeftHorizontal = lines2intersectionPt(
		innerCenter,
		-slope,
		rightTipLeft,
		0
	)
	const [lowerLeftHorizontal] = mirrorPtsV(1024, [upperLeftHorizontal])

	const outline = [
		outerCenter,
		outerTop,
		middleTop,
		innerTop,
		upperLeftHorizontal,
		rightTipLeft,
		rightTip,
		rightTipRight,
		lowerLeftHorizontal,
		innerBottom,
		middleBottom,
		outerBottom,
	]

	return [
		outline,

		[outerCenter, outerTop, topInset, middleCenter],
		[outerTop, middleTop, topInset],
		[topInset, middleTop, innerTop],
		[middleCenter, topInset, innerTop, upperLeftHorizontal, middleCenter],

		[middleCenter, upperLeftHorizontal, rightTipLeft, rightTipInset],

		[rightTipInset, rightTipLeft, rightTip],
		[rightTipInset, rightTip, rightTipRight],

		[middleCenter, rightTipInset, rightTipRight, lowerLeftHorizontal],

		[middleCenter, lowerLeftHorizontal, innerBottom, bottomInset],
		[bottomInset, innerBottom, middleBottom],
		[bottomInset, middleBottom, outerBottom],
		[outerCenter, middleCenter, bottomInset, outerBottom],
	]
}

export const FOld = (sw: number): IPts[] => {
	const [CPts, verticalPts] = K(sw)

	const centerLine = translatePts(
		[sw / 2, sw / 2],
		mirrorPtsVOnCenter(tail(sw))
	)

	const centerLine2 = translatePts(
		[-sw / 2, -sw / 2],
		mirrorPtsVOnCenter(mirrorPtsHOnCenter(centerLine))
	)

	const outerLine = CPts.filter((pt) => {
		return pt[1] <= 1024
	})

	return [
		outerLine,
		verticalPts,
		mirrorPtsV(1024, centerLine),
		mirrorPtsV(1024, centerLine2),

		translatePtsY(1024 - sw / 2, tip(sw, 270)),
	]
}

export const F = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const [left, tail] = f(sw)

	return [left, tail, translatePtsY(swD45 * 2, tail)]
}

export const G = (sw: number): IPts[] => {
	const geo = CGeometry(sw)

	const {
		outerTop,
		middleTop,
		innerTop,

		outerCenter,
		middleCenter,
		innerCenter,

		innerBottom,
		middleBottom,
		outerBottom,
	} = geo

	const w = pts2MaxX(Object.values(geo))

	const [leftTip, leftTipRight, leftTipLeft] = [
		pt(w - sw * 2, 1024),
		pt(w - sw * 1.5, 1024 - sw / 2),
		pt(w - sw * 1.5, 1024 + sw / 2),
	]
	const leftTipInset = translatePt([sw, 0], leftTip)

	const outerRightDashInterSection = pt(w, 1024 - sw / 2)

	const [upperTipLeft, upperTip, upperTipRight] = translatePts(
		[w - sw, 1024 - sw * 2],
		tip(sw, 180)
	)
	const upperTipInset = translatePt([0, -sw], upperTip)

	const slope = CBasedGlyphSlope(sw)

	const innerUpperIntersection = pt(
		upperTipRight[0],
		getYFromXOnLine(innerCenter, slope, upperTipRight[0])
	)

	const [innerLowerIntersection] = mirrorPtsV(1024, [innerUpperIntersection])

	const innerLeftDashIntersection = pt(
		innerLowerIntersection[0],
		leftTipLeft[1]
	)

	// const upperMiddleIntersection = avgPts([innerUpperIntersection, middleTop])
	// const [lowerMiddleIntersection] = mirrorPtsV(1024, [
	// 	upperMiddleIntersection,
	// ])

	const middleDashIntersection = avgPts([
		outerRightDashInterSection,
		innerLeftDashIntersection,
	])

	const lowerMiddleIntersection = pt(
		middleDashIntersection[0],
		getYFromXOnLine(middleCenter, -slope, middleDashIntersection[0])
	)

	const [upperMiddleIntersection] = mirrorPtsV(1024, [
		lowerMiddleIntersection,
	])

	return [
		// [
		// 	outerCenter,
		// 	outerTop,
		// 	middleTop,

		// 	upperTipLeft,
		// 	upperTip,
		// 	upperTipRight,

		// 	innerUpperIntersection,

		// 	innerCenter,

		// 	innerLowerIntersection,
		// 	innerLeftDashIntersection,

		// 	leftTipLeft,
		// 	leftTip,
		// 	leftTipRight,

		// 	outerRightDashInterSection,

		// 	innerBottom,
		// 	middleBottom,
		// 	outerBottom,
		// ],

		// outer upper /
		[outerCenter, outerTop, upperMiddleIntersection, middleCenter],

		// upper right tip
		[outerTop, middleTop, upperMiddleIntersection],

		// outer upper vertical |
		[upperMiddleIntersection, middleTop, upperTipLeft, upperTipInset],

		// upper tip
		[upperTipInset, upperTipLeft, upperTip],
		[upperTipRight, upperTipInset, upperTip],

		// inner upper vertical |
		[
			upperTipRight,
			innerUpperIntersection,
			upperMiddleIntersection,
			upperTipInset,
		],

		// inner upper diagonal /
		[
			middleCenter,
			upperMiddleIntersection,
			innerUpperIntersection,
			innerCenter,
		],

		// inner lower diagonal \
		[
			middleCenter,
			innerCenter,
			innerLowerIntersection,
			lowerMiddleIntersection,
		],

		// inner lower vertical
		[
			innerLowerIntersection,
			innerLeftDashIntersection,
			middleDashIntersection,
			lowerMiddleIntersection,
		],

		// lower dash
		[
			leftTipLeft,
			leftTipInset,
			middleDashIntersection,
			innerLeftDashIntersection,
		],

		// left tip
		[leftTip, leftTipInset, leftTipLeft],
		[leftTip, leftTipRight, leftTipInset],

		// upper dash
		[
			leftTipRight,
			outerRightDashInterSection,
			middleDashIntersection,
			leftTipInset,
		],

		// outer right lower vertical
		[
			middleDashIntersection,
			outerRightDashInterSection,
			middleBottom,
			lowerMiddleIntersection,
		],

		// lower right corner
		[outerBottom, lowerMiddleIntersection, middleBottom],

		// outer lower diagonal \
		[outerCenter, middleCenter, lowerMiddleIntersection, outerBottom],

		// dot(sw, lowerMiddleIntersection),
	]
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
	return [...C_old(sw), translatePtsX(sw / 2, vertical(sw, 0, 2048))]
}
export const L = (sw: number): IPts[] => {
	return [vertical(sw, 0, 2048), tail(sw, 1.25)]
}

export const M = (sw: number): IPts[] => {
	const mStrokes = mFlat(sw)

	const yThreshold = 2028 - sw / 2
	const minY = pts2MinY(mStrokes.flat())

	return stretchStrokesUpward(yThreshold, -minY, mStrokes)
}

export const N = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	// left pts
	const topLeftTip = pt(sw / 2, 0)
	const topLeftTipLeft = pt(0, sw / 2)
	const topLeftTipRight = pt(sw, sw / 2)
	const topLeftTipInset = translatePt([0, sw], topLeftTip)

	const [
		bottomLeftTip,
		bottomLeftTipLeft,
		bottomLeftTipRight,
		bottomLeftTipInset,
	] = mirrorPtsV(1024, [
		topLeftTip,
		topLeftTipLeft,
		topLeftTipRight,
		topLeftTipInset,
	])

	// right pts
	const nFaces = n(sw)
	const maxX = pts2MaxX(nFaces.flat())
	const midX = (maxX + sw) / 2

	const [
		topRightTip,
		topRightTipRight,
		topRightTipLeft,
		topRightTipInset,
		bottomRightTip,
		bottomRightTipRight,
		bottomRightTipLeft,
		bottomRightTipInset,
	] = mirrorPtsH(midX, [
		topLeftTip,
		topLeftTipLeft,
		topLeftTipRight,
		topLeftTipInset,

		bottomLeftTip,
		bottomLeftTipRight,
		bottomLeftTipLeft,
		bottomLeftTipInset,
	])

	const middleMidPt = pt(midX, 1024)
	const [upperMidPt] = translatePtsY(-swD45 / 2, [middleMidPt])
	const [lowerMidPt] = translatePtsY(swD45 / 2, [middleMidPt])

	const upperLeftDiagonalIntersection = pt(
		topLeftTipRight[0],
		upperMidPt[1] - (upperMidPt[0] - topLeftTipRight[0])
	)
	const middleLeftDiagonalIntersection = pt(
		topLeftTip[0],
		middleMidPt[1] - (middleMidPt[0] - topLeftTip[0])
	)
	const lowerLeftDiagonalIntersection = pt(
		topLeftTipRight[0],
		lowerMidPt[1] - (lowerMidPt[0] - topLeftTipRight[0])
	)

	const [
		lowerRightDiagonalIntersection,
		middleRightDiagonalIntersection,
		upperRightDiagonalIntersection,
	] = mirrorPtsV(
		1024,
		mirrorPtsH(midX, [
			upperLeftDiagonalIntersection,
			middleLeftDiagonalIntersection,
			lowerLeftDiagonalIntersection,
		])
	)

	return [
		// left vertical
		[topLeftTipLeft, topLeftTip, topLeftTipInset],
		[topLeftTip, topLeftTipRight, topLeftTipInset],

		[
			topLeftTipInset,
			topLeftTipRight,
			upperLeftDiagonalIntersection,
			middleLeftDiagonalIntersection,
		],

		// upper diagonal
		[
			middleLeftDiagonalIntersection,
			upperLeftDiagonalIntersection,
			upperRightDiagonalIntersection,
			middleRightDiagonalIntersection,
		],

		// right vertical
		[
			upperRightDiagonalIntersection,
			topRightTipLeft,
			topRightTipInset,
			middleRightDiagonalIntersection,
		],

		[topRightTipLeft, topRightTip, topRightTipInset],
		[topRightTip, topRightTipRight, topRightTipInset],

		[
			topRightTipInset,
			topRightTipRight,
			bottomRightTipLeft,
			bottomRightTipInset,
		],

		[bottomRightTipInset, bottomRightTipLeft, bottomRightTip],
		[bottomRightTipInset, bottomRightTip, bottomRightTipRight],

		[
			lowerRightDiagonalIntersection,
			middleRightDiagonalIntersection,
			bottomRightTipInset,
			bottomRightTipRight,
		],

		// lower diagonal
		[
			middleLeftDiagonalIntersection,
			middleRightDiagonalIntersection,
			lowerRightDiagonalIntersection,
			lowerLeftDiagonalIntersection,
		],

		// left vertical continued
		[
			middleLeftDiagonalIntersection,
			lowerLeftDiagonalIntersection,
			// @note this name may be incorrect, but everything else relies on the wrong name...
			bottomLeftTipRight,
			bottomLeftTipInset,
		],

		[bottomLeftTipInset, bottomLeftTipRight, bottomLeftTip],
		[bottomLeftTipInset, bottomLeftTipLeft, bottomLeftTip],

		[
			topLeftTipLeft,
			topLeftTipInset,
			bottomLeftTipInset,
			bottomLeftTipLeft,
		],
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

export const R = (sw: number): IPts[] => {
	const PPts = P(sw)

	const maxX = pts2MaxX(PPts.flat())

	return [
		...PPts,
		translatePts([maxX - sw, 512], tip(sw, 45)),
		mirrorPtsH(
			sw / 2,
			rotatePts(
				-45 * 1.5 - 180,
				[sw / 2, 1024],
				horizontal(sw, 1024 * 1.15)
			)
		),
	]
}

export const S = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const third = 2048 / 3

	const upperSegment = [
		pt(0 - swD45 / 2, third),
		...translatePtsX(third - sw / 2, tip(sw, 45)),
		pt(0 + swD45 / 2, third),
	]

	const lowerSegment = mirrorPtsHOnCenter(mirrorPtsV(1024, upperSegment))

	const path = upperSegment.concat(lowerSegment)

	const minX = pts2MinX(path)

	return [translatePtsX(-minX, path)]
}
export const T = (sw: number): IPts[] => {
	const right = tail(sw, 1.25)
	const left = mirrorPtsH(sw / 2, right)

	const minX = pts2MinX(left)

	return [vertical(sw, 0, 2048), left, right].map((stroke) =>
		mirrorPtsV(1024, translatePtsX(-minX, stroke))
	)
}

export const U = (sw: number): IPts[] => {
	const MPts = M(sw)
	const maxX = pts2MaxX(MPts.flat()) - sw

	const left = vertical(sw, 0, 2048)
	const right = translatePtsX(maxX, left)

	const _ = translatePtsY(1024 - sw, horizontal(sw, maxX + sw))

	return [left, _, right]
}

export const V = (sw: number): IPts[] => {
	const [NShape] = A(sw)

	const midX = pts2MidX(NShape)

	return [mirrorPtsH(midX, mirrorPtsV(1024, NShape))]
}

export const W = (sw: number): IPts[] => {
	return M(sw).map((stroke) => mirrorPtsV(1024, stroke))
}

export const X = (sw: number): IPts[] => {
	const MPts = M(sw)

	const diagonal = rotatePts(
		-27.5,
		[sw / 2, sw / 2],
		vertical(sw, 0, 2048 * 1.1)
	)

	const midX = pts2MidX(MPts.flat())

	const gtPts = gt(sw)

	const midlineHDiff = pts2MidY(gtPts) - 1024

	const centerGtPts = translatePts([sw / 2, -1 * midlineHDiff], gtPts)

	const centerLtPts = mirrorPtsH(pts2MaxX(centerGtPts), centerGtPts)

	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const nwPts = [
		pt(0, midlineHDiff + swD45 - sw / 2),
		...tip(sw, 0),
		pt(sw, midlineHDiff + swD45 - sw),
	]
	const swPts = mirrorPtsV(1024, nwPts)

	// center of the inner and outer pts
	const minGtPts = pts2MinX(centerGtPts)
	const [aX, bX] = centerGtPts
		.filter((pt) => pt[0] !== minGtPts)
		.map(([x]) => x)
	const XCenterX = (aX + bX) / 2

	const [outerGtPt, innerGtPt] = centerGtPts.filter(
		(pt) => pt[0] !== minGtPts
	)
	// @todo fix the intersection pt at the top of the gt? (compare with return `[nwPts, centerGtPts]`)
	const leftSide = [
		...nwPts,
		outerGtPt,
		...swPts.slice().reverse(),
		innerGtPt,
	]

	return [leftSide, mirrorPtsH(XCenterX, leftSide)]
}

export const Y = (sw: number): IPts[] => {
	const [verticalPts, leftPts, rightPts] = T(sw)

	const midY = pts2MidY(leftPts)

	const strokes = [
		verticalPts,
		mirrorPtsV(midY, leftPts),
		mirrorPtsV(midY, rightPts),
	]

	const minX = pts2MinX(strokes.flat())

	return strokes.map((stroke) => translatePtsX(-minX, stroke))
}

export const Z = (sw: number): IPts[] => {
	return [mirrorPtsHOnCenter(S(sw)[0])]
}
