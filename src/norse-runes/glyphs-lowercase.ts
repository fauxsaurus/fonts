import {gt, horizontal, lt, tail, tip, vertical} from './stroke-components'
import {
	avgPts,
	mirrorPtsH,
	mirrorPtsV,
	mirrorPtsVOnCenter,
	pt,
	pts2MaxX,
	pts2MaxY,
	pts2MidX,
	pts2MidY,
	pts2MinX,
	pts2MinY,
	translatePt,
	translatePts,
	translatePtsX,
	translatePtsY,
	type IPts,
} from './util'

import {
	e as flatE,
	b as flatB,
	n as flatN,
	o as oFlat,
} from './glyphs-lowercase-flat'

// @todo use this in `gt()` to simplify calculations?
const getLowercaseMidY = (sw: number) => c(sw)[0].find(([x]) => x === 0)![1]

export const a = (sw: number): IPts[] => {
	const oPts = oFlat(sw)
	const [_, gtPts] = oPts

	const maxX = pts2MaxX(gtPts)
	const minY = pts2MinY(gtPts)
	const maxY = pts2MaxY(gtPts)

	const [
		topTipLeft,
		topTip,
		topTipRight,
		bottomTipLeft,
		bottomTip,
		bottomTipRight,
	] = translatePts([maxX - sw * 1.5, 0], vertical(sw, minY, maxY))

	const topTipInset = translatePt([0, sw], topTip)
	const bottomTipInset = translatePt([0, -sw], bottomTip)

	const {
		topOuter,
		topMiddle,
		topInner,

		bottomOuter,
		bottomMiddle,
		bottomInner,

		leftOuter,
		leftMiddle,
		leftInner,

		rightOuter,
		rightMiddle,
		rightInner,
	} = oGeometry(sw)

	const upperLeftIntersection = pt(
		topTipLeft[0],
		topOuter[1] + (topTipLeft[0] - topOuter[0])
	)

	const upperMiddleIntersection = pt(
		topTip[0],
		topMiddle[1] + (topTip[0] - topMiddle[0])
	)

	const upperRightIntersection = pt(
		topTipRight[0],
		rightOuter[1] - (rightOuter[0] - topTipRight[0])
	)

	const lowerRightIntersection = pt(
		topTipRight[0],
		rightOuter[1] + (rightOuter[0] - topTipRight[0])
	)

	const lowerMiddleIntersection = pt(
		bottomTip[0],
		bottomMiddle[1] - (bottomTip[0] - bottomMiddle[0])
	)

	const lowerLeftIntersection = pt(
		bottomTipRight[0],
		bottomOuter[1] - (bottomTipRight[0] - bottomOuter[0])
	)

	return [
		// top left circle
		[leftOuter, topOuter, topMiddle, leftMiddle],
		[topOuter, upperLeftIntersection, upperMiddleIntersection, topMiddle],

		// # upper vertical
		[
			topTipLeft,
			topTipInset,
			upperMiddleIntersection,
			upperLeftIntersection,
		],
		[topTipLeft, topTip, topTipInset],
		[topTip, topTipRight, topTipInset],
		[
			topTipInset,
			topTipRight,
			upperRightIntersection,
			upperMiddleIntersection,
		],
		// # right corner
		[
			upperMiddleIntersection,
			upperRightIntersection,
			rightOuter,
			rightMiddle,
		],
		[
			rightMiddle,
			rightOuter,
			lowerRightIntersection,
			lowerMiddleIntersection,
		],
		// lower vertical
		[
			lowerMiddleIntersection,
			lowerRightIntersection,
			bottomTipLeft,
			bottomTipInset,
		],
		[bottomTipInset, bottomTipLeft, bottomTip],
		[bottomTipInset, bottomTip, bottomTipRight],
		[
			lowerLeftIntersection,
			lowerMiddleIntersection,
			bottomTipInset,
			bottomTipRight,
		],
		// rest of circle
		[
			bottomMiddle,
			lowerMiddleIntersection,
			lowerLeftIntersection,
			bottomOuter,
		],
		[leftOuter, leftMiddle, bottomMiddle, bottomOuter],

		[leftMiddle, topMiddle, topInner, leftInner],
		[topMiddle, rightMiddle, rightInner, topInner],
		[rightInner, rightMiddle, bottomMiddle, bottomInner],
		[leftMiddle, leftInner, bottomInner, bottomMiddle],
	]
}

export const b = (sw: number): IPts[] => {
	const sw2D45 = sw / Math.SQRT2 // half diagonal stroke width (@ 45 deg angle)

	// vertical
	const [
		topTipLeft,
		topTip,
		topTipRight,
		bottomTipLeft,
		bottomTip,
		bottomTipRight,
	] = vertical(sw)

	const topTipInset = translatePt([0, sw], topTip)

	// loop
	const loop = translatePtsX(sw / 2, gt(sw))
	const maxX = pts2MaxX(loop)
	const rightOuter = loop.find((pt) => pt[0] === maxX)!
	const [rightMiddle] = translatePtsX(-sw2D45, [rightOuter])
	const [rightInner] = translatePtsX(-sw2D45, [rightMiddle])

	// intersections
	const upperOuterIntersection = pt(
		topTipRight[0],
		rightOuter[1] - (rightOuter[0] - topTipRight[0])
	)
	const upperMiddleIntersection = pt(
		topTip[0],
		rightMiddle[1] - (rightMiddle[0] - topTip[0])
	)
	const upperInnerIntersection = pt(
		topTipRight[0],
		rightInner[1] - (rightInner[0] - topTipRight[0])
	)

	const lowerInnerIntersection = pt(
		bottomTipLeft[0],
		rightInner[1] + (rightInner[0] - bottomTipLeft[0])
	)
	const lowerMiddleIntersection = pt(
		bottomTip[0],
		rightMiddle[1] + (rightMiddle[0] - bottomTip[0])
	)

	return [
		// vertical
		[topTipLeft, topTip, topTipInset],
		[topTip, topTipRight, topTipInset],
		[
			topTipInset,
			topTipRight,
			upperOuterIntersection,
			upperMiddleIntersection,
		],
		// loop (outer)
		[
			upperMiddleIntersection,
			upperOuterIntersection,
			rightOuter,
			rightMiddle,
		],
		[rightMiddle, rightOuter, bottomTip, lowerMiddleIntersection],
		// vertical (left)
		[bottomTipRight, lowerMiddleIntersection, bottomTip],
		[topTipLeft, topTipInset, lowerMiddleIntersection, bottomTipRight],
		// loop (inner)
		[
			upperMiddleIntersection,
			rightMiddle,
			rightInner,
			upperInnerIntersection,
		],
		[
			lowerInnerIntersection,
			rightInner,
			rightMiddle,
			lowerMiddleIntersection,
		],
		[
			upperMiddleIntersection,
			upperInnerIntersection,
			lowerInnerIntersection,
			lowerMiddleIntersection,
		],
	]
}

const cGeometry = (sw: number) => {
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

	return {
		topTipLeft: topOuter,
		topTip: translatePt([sw2D45, 0], topOuter),
		topTipRight: translatePt([sw2D45, sw2D45], topOuter),
		topTipInset: translatePt([0, sw2D45], topOuter),

		centerLeft: outerCenter,
		centerMiddle: avgPts([outerCenter, innerCenter]),
		centerRight: innerCenter,

		bottomTipLeft: translatePt([sw2D45, -sw2D45], bottomOuter),
		bottomTip: translatePt([sw2D45, 0], bottomOuter),
		bottomTipRight: bottomOuter,
		bottomTipInset: translatePt([0, -sw2D45], bottomOuter),
	}
}

export const c = (sw: number): IPts[] => {
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

export const d = (sw: number): IPts[] => {
	const bPts = b(sw)
	const maxX = pts2MaxX(bPts.flat())
	const yAxis = maxX / 2

	return bPts.map((face) => mirrorPtsH(yAxis, face))
}

export const e = (sw: number): IPts[] => {
	const sw2 = sw / 2

	const {
		topTipLeft,
		topTip,
		topTipRight,
		topTipInset,

		centerLeft,
		centerMiddle,
		centerRight,

		bottomTipLeft,
		bottomTip,
		bottomTipRight,
		bottomTipInset,
	} = cGeometry(sw)

	const dashTip = pt(topTip[0] + sw2, centerLeft[1])
	const dashTipLeft = pt(topTip[0], centerLeft[1] - sw2)
	const dashTipRight = pt(topTip[0], centerLeft[1] + sw2)
	const dashTipInset = pt(topTip[0] - sw2, centerLeft[1])

	const upperLeftDashIntersection = pt(centerRight[0] + sw2, dashTipLeft[1])
	const lowerLeftDashIntersection = pt(centerRight[0] + sw2, dashTipRight[1])

	return [
		[topTipLeft, topTip, topTipInset],
		[topTip, topTipRight, topTipInset],

		[centerLeft, topTipLeft, topTipInset, centerMiddle],
		[centerMiddle, topTipInset, topTipRight, upperLeftDashIntersection],

		[centerMiddle, upperLeftDashIntersection, dashTipLeft, dashTipInset],

		[dashTipInset, dashTipLeft, dashTip],
		[dashTipInset, dashTip, dashTipRight],

		[centerMiddle, dashTipInset, dashTipRight, lowerLeftDashIntersection],

		[
			centerMiddle,
			lowerLeftDashIntersection,
			bottomTipLeft,
			bottomTipInset,
		],
		[centerLeft, centerMiddle, bottomTipInset, bottomTipRight],

		[bottomTipInset, bottomTipLeft, bottomTip],
		[bottomTipInset, bottomTip, bottomTipRight],
	]
}

export const f = (sw: number): IPts[] => {
	return t(sw).map((stroke) => mirrorPtsV(1024, stroke))
}

export const g = (sw: number): IPts[] => {
	const qPts = q(sw)

	const tailPts = tail(sw)

	const offsetX = pts2MaxX(qPts.flat()) - sw
	const offsetY = pts2MaxY(qPts.flat()) - sw / 2 - pts2MaxY(tailPts)

	return qPts.concat([
		translatePts([offsetX, offsetY], mirrorPtsH(sw / 2, tailPts)),
	])
}

export const h = (sw: number): IPts[] => {
	// vertical
	const topTipLeft = pt(0, sw / 2)
	const topTip = pt(sw / 2, 0)
	const topTipRight = pt(sw, sw / 2)

	const topTipInset = translatePt([0, sw], topTip)

	const bottomTipRight = pt(sw, 2048 - sw / 2)
	const bottomTip = pt(sw / 2, 2048)
	const bottomTipLeft = pt(0, 2048 - sw / 2)

	const bottomTipInset = translatePt([0, -sw], bottomTip)

	// arch
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const geometry = nGeometry(sw)

	const diagonalUpperLeft = pt(sw, geometry.diagonalLowerLeft[1] - swD45)

	return [
		...n(sw).filter((_, i) => i !== 1 && i < 8),

		[
			geometry.topTipInset,
			diagonalUpperLeft,
			geometry.diagonalTopRight,
			geometry.bottomRightDiagonalInset,
		],

		[topTipLeft, topTip, topTipInset],
		[topTipInset, topTipRight, diagonalUpperLeft, geometry.topTipInset],
		[topTip, topTipRight, topTipInset],

		[bottomTipInset, bottomTipRight, bottomTip],
		[bottomTipLeft, bottomTipInset, bottomTip],

		[topTipLeft, topTipInset, bottomTipInset, bottomTipLeft],
	]
}

export const i = (sw: number): IPts[] => {
	const dotMinY = 1024 - sw * 3.5
	const dotH = sw * 2

	const verticalMinY = 1024 - sw / 2

	const geometry = lGeometry(sw)

	const {
		bottomTip,
		bottomTipLeft,

		tailTip,
		tailTipLeft,
		tailTipRight,
		tailTipInset,

		upperTail_VerticalRight,
		tailMiddle_verticalMiddle,
	} = geometry

	const [topTip, topTipLeft, topTipRight, topTipInset] = translatePts(
		[0, verticalMinY],
		[
			geometry.topTip,
			geometry.topTipLeft,
			geometry.topTipRight,
			geometry.topTipInset,
		]
	)

	const [
		topDotLeft,
		topDot,
		topDotRight,
		bottomDotLeft,
		bottomDot,
		bottomDotRight,
	] = vertical(sw, dotMinY, dotMinY + dotH)

	const dotInset = pt(topDot[0], topDot[1] + sw)
	const topDotInset = dotInset // pt(topDot[0], topDot[1] + sw)
	const bottomDotInset = dotInset // pt(bottomDot[0], bottomDot[1] - sw)

	return [
		// dot
		[topDotLeft, topDot, topDotInset],
		[topDot, topDotRight, topDotInset],

		[topDotInset, topDotRight, bottomDotLeft],

		[bottomDotInset, bottomDotLeft, bottomDot],
		[bottomDotInset, bottomDot, bottomDotRight],

		[topDotLeft, topDotInset, bottomDotRight],

		// vertical
		[topTipLeft, topTip, topTipInset],
		[topTip, topTipRight, topTipInset],

		[
			topTipInset,
			topTipRight,
			upperTail_VerticalRight,
			tailMiddle_verticalMiddle,
		],

		[
			upperTail_VerticalRight,
			tailTipLeft,
			tailTipInset,
			tailMiddle_verticalMiddle,
		],
		[tailTipLeft, tailTip, tailTipInset],
		[tailTipInset, tailTip, tailTipRight],
		[tailMiddle_verticalMiddle, tailTipInset, tailTipRight, bottomTip],

		[bottomTipLeft, tailMiddle_verticalMiddle, bottomTip],

		[topTipLeft, topTipInset, tailMiddle_verticalMiddle, bottomTipLeft],
	]
}

export const j = (sw: number): IPts[] => {
	const [verticalPts, _ltPts, tailPts] = g(sw)
	const [dot] = i(sw)

	const maxX = pts2MaxX(verticalPts) - sw

	const strokes = [verticalPts, tailPts, translatePtsX(maxX, dot)]

	const minX = pts2MinX(strokes.flat())

	return strokes.map((pts) => translatePtsX(-minX, pts))
}

export const k = (sw: number): IPts[] => {
	const [cPts] = c(sw)

	const minY = pts2MinY(cPts)
	const maxY = pts2MaxY(cPts)

	return [translatePtsX(sw / 2, vertical(sw, minY, maxY)), cPts]
}

const lGeometry = (sw: number) => {
	// outline
	const topTipLeft = pt(0, sw / 2)
	const topTip = pt(sw / 2, 0)
	const topTipRight = pt(sw, sw / 2)

	const bottomTipRight = pt(sw, 2048 - sw / 2)
	const bottomTip = pt(sw / 2, 2048)
	const bottomTipLeft = pt(0, 2048 - sw / 2)

	const [tailTipLeft, tailTip, tailTipRight] = tail(sw).filter(
		([x]) => x > sw
	)

	// inset
	const topTipInset = translatePt([0, sw], topTip)
	const tailTipInset = pt(tailTipLeft[0], tailTipRight[1])

	// intersections
	// upper tail diagonal intersecting the eastern vertical
	const upperTail_VerticalRight = pt(
		topTipRight[0],
		tailTipLeft[1] - (topTipRight[0] - tailTipLeft[0])
	)

	// center tail diagonal intersecting the central vertical
	const tailMiddle_verticalMiddle = pt(
		topTip[0],
		tailTip[1] - (topTip[0] - tailTip[0])
	)

	return {
		topTip,
		topTipLeft,
		topTipRight,
		topTipInset,

		bottomTip,
		bottomTipLeft,

		tailTip,
		tailTipLeft,
		tailTipRight,
		tailTipInset,

		upperTail_VerticalRight,
		tailMiddle_verticalMiddle,
	}
}

export const l = (sw: number): IPts[] => {
	const {
		topTip,
		topTipLeft,
		topTipRight,
		topTipInset,

		bottomTip,
		bottomTipLeft,

		tailTip,
		tailTipLeft,
		tailTipRight,
		tailTipInset,

		upperTail_VerticalRight,
		tailMiddle_verticalMiddle,
	} = lGeometry(sw)

	return [
		[topTipLeft, topTip, topTipInset],
		[topTip, topTipRight, topTipInset],

		[
			topTipInset,
			topTipRight,
			upperTail_VerticalRight,
			tailMiddle_verticalMiddle,
		],

		[
			upperTail_VerticalRight,
			tailTipLeft,
			tailTipInset,
			tailMiddle_verticalMiddle,
		],
		[tailTipLeft, tailTip, tailTipInset],
		[tailTipInset, tailTip, tailTipRight],
		[tailMiddle_verticalMiddle, tailTipInset, tailTipRight, bottomTip],

		[bottomTipLeft, tailMiddle_verticalMiddle, bottomTip],

		[topTipLeft, topTipInset, tailMiddle_verticalMiddle, bottomTipLeft],
	]
}

export const m = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const geometry = nGeometry(sw)

	const {
		topTipLeft: topLeftTipLeft,
		topTip: topLeftTip,
		diagonalTopRight: upperCenterTmp,

		diagonalLowerLeft: innerLeft,

		leftTip: lowerLeftTip,
		leftTipLeft: lowerLeftTipLeft,
		leftTipRight: lowerLeftTipRight,
	} = geometry

	const [upperCenter] = translatePts([-sw, -sw], [upperCenterTmp])

	const [lowerCenter] = translatePtsY(swD45, [upperCenter])

	const [
		topRightTipRight,
		topRightTip,

		bottomRightTip,
		bottomRightTipLeft,
		bottomRightTipRight,

		innerRight,
	] = mirrorPtsH(lowerCenter[0], [
		topLeftTipLeft,
		topLeftTip,

		lowerLeftTip,
		lowerLeftTipLeft,
		lowerLeftTipRight,

		innerLeft,
	])

	const {
		topTip,
		topTipLeft,
		topTipInset,

		leftTip,
		// wrong names in nGeometry
		leftTipLeft: leftTipRight,
		leftTipRight: leftTipLeft,
		leftTipInset,

		rightTip,
		rightTipLeft,
		rightTipRight,
		rightTipInset,

		diagonalTopRight,
		diagonalLowerLeft,
		diagonalLowerRight,
		bottomRightDiagonalInset,
	} = geometry

	const middleCenter = avgPts([upperCenter, lowerCenter])

	return [
		// top left tip
		[
			topLeftTipLeft,
			topLeftTip,

			upperCenter,

			topRightTip,
			topRightTipRight,

			bottomRightTipLeft,
			bottomRightTip,
			bottomRightTipRight,

			innerRight,

			lowerCenter,

			innerLeft,

			lowerLeftTipRight,
			lowerLeftTip,
			lowerLeftTipLeft,
		],

		[topTipLeft, topTip, topTipInset],

		// upper \
		[topLeftTip, upperCenter, middleCenter, topTipInset],
		// upper /
		mirrorPtsH(lowerCenter[0], [
			topLeftTip,
			upperCenter,
			middleCenter,
			topTipInset,
		]),
		// right vertical
		mirrorPtsH(lowerCenter[0], [topTipLeft, topTip, topTipInset]),
		mirrorPtsH(lowerCenter[0], [
			topTipLeft,
			topTipInset,
			leftTipInset,
			leftTipRight,
		]),
		mirrorPtsH(lowerCenter[0], [leftTipRight, leftTipInset, leftTip]),
		mirrorPtsH(lowerCenter[0], [leftTipInset, leftTipLeft, leftTip]),
		mirrorPtsH(lowerCenter[0], [
			topTipInset,
			diagonalLowerLeft,
			leftTipLeft,
			leftTipInset,
		]),
		// lower /
		mirrorPtsH(lowerCenter[0], [
			topTipInset,
			middleCenter,
			lowerCenter,
			diagonalLowerLeft,
		]),
		// lower \
		[topTipInset, middleCenter, lowerCenter, diagonalLowerLeft],
		// left vertical
		[topTipInset, diagonalLowerLeft, leftTipLeft, leftTipInset],
		[leftTipInset, leftTipLeft, leftTip],
		[leftTipRight, leftTipInset, leftTip],
		[topTipLeft, topTipInset, leftTipInset, leftTipRight],
	]
}

const nGeometry = (sw: number) => {
	const sw2 = sw / 2 // half stroke width
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const gtPts = flatB(sw)[1]

	const maxX = pts2MaxX(gtPts)

	const minY = pts2MinY(gtPts)

	const topTip = pt(sw2, minY)
	const topTipLeft = pt(0, minY + sw2)
	const topTipInset = pt(sw2, minY + swD45 / 2)

	const leftTip = pt(sw2, 2048)
	const leftTipLeft = pt(0, 2048 - sw2)
	const leftTipRight = pt(sw, 2048 - sw2)
	const leftTipInset = pt(sw2, 2048 - sw)

	const rightTip = pt(maxX - sw2, 2048)
	const rightTipLeft = pt(maxX - sw, 2048 - sw2)
	const rightTipRight = pt(maxX, 2048 - sw2)
	const rightTipInset = pt(maxX - sw2, 2048 - sw)

	const topLeft2rightDistance = maxX - topTip[0]
	const diagonalTopRight = pt(maxX, topTip[1] + topLeft2rightDistance)

	const diagonalLowerLeft = pt(sw, minY + sw2 + swD45)
	const diagonalLowerRight = pt(
		maxX - sw,
		diagonalLowerLeft[1] + (maxX - sw - diagonalLowerLeft[0])
	)

	const bottomRightDiagonalInset = avgPts([
		diagonalTopRight,
		diagonalLowerRight,
	])

	return {
		topTip,
		topTipLeft,
		topTipInset,

		leftTip,
		leftTipLeft,
		leftTipRight,
		leftTipInset,

		rightTip,
		rightTipLeft,
		rightTipRight,
		rightTipInset,

		diagonalTopRight,
		diagonalLowerLeft,
		diagonalLowerRight,
		bottomRightDiagonalInset,
	}
}

export const n = (sw: number): IPts[] => {
	const {
		topTip,
		topTipLeft,
		topTipInset,

		leftTip,
		leftTipLeft,
		leftTipRight,
		leftTipInset,

		rightTip,
		rightTipLeft,
		rightTipRight,
		rightTipInset,

		diagonalTopRight,
		diagonalLowerLeft,
		diagonalLowerRight,
		bottomRightDiagonalInset,
	} = nGeometry(sw)

	return [
		[topTipLeft, topTip, topTipInset],
		[topTip, diagonalTopRight, bottomRightDiagonalInset, topTipInset],
		[
			bottomRightDiagonalInset,
			diagonalTopRight,
			rightTipRight,
			rightTipInset,
		],
		[rightTipInset, rightTipRight, rightTip],
		[rightTipLeft, rightTipInset, rightTip],
		[
			diagonalLowerRight,
			bottomRightDiagonalInset,
			rightTipInset,
			rightTipLeft,
		],
		[
			topTipInset,
			bottomRightDiagonalInset,
			diagonalLowerRight,
			diagonalLowerLeft,
		],
		[topTipInset, diagonalLowerLeft, leftTipRight, leftTipInset],
		[leftTipInset, leftTipRight, leftTip],
		[leftTipLeft, leftTipInset, leftTip],
		[topTipLeft, topTipInset, leftTipInset, leftTipLeft],
	]
}

const oGeometry = (sw: number) => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const ltPts = lt(sw)
	const centerX = pts2MaxX(ltPts)
	const maxX = centerX * 2

	const minY = pts2MinY(ltPts)
	const centerY = (2048 - minY) / 2 + minY

	const topOuter = pt(centerX, minY)
	const topMiddle = pt(centerX, minY + swD45 / 2)
	const topInner = pt(centerX, minY + swD45)

	const bottomOuter = pt(centerX, 2048)
	const bottomMiddle = pt(centerX, 2048 - swD45 / 2)
	const bottomInner = pt(centerX, 2048 - swD45)

	const leftOuter = pt(0, centerY)
	const leftMiddle = pt(swD45 / 2, centerY)
	const leftInner = pt(swD45, centerY)

	const rightOuter = pt(maxX, centerY)
	const rightMiddle = pt(maxX - swD45 / 2, centerY)
	const rightInner = pt(maxX - swD45, centerY)

	return {
		topOuter,
		topMiddle,
		topInner,

		bottomOuter,
		bottomMiddle,
		bottomInner,

		leftOuter,
		leftMiddle,
		leftInner,

		rightOuter,
		rightMiddle,
		rightInner,
	}
}

export const o = (sw: number): IPts[] => {
	const {
		topOuter,
		topMiddle,
		topInner,

		bottomOuter,
		bottomMiddle,
		bottomInner,

		leftOuter,
		leftMiddle,
		leftInner,

		rightOuter,
		rightMiddle,
		rightInner,
	} = oGeometry(sw)

	return [
		[topOuter, rightOuter, rightMiddle, topMiddle],
		[rightMiddle, rightOuter, bottomOuter, bottomMiddle],
		[leftOuter, leftMiddle, bottomMiddle, bottomOuter],
		[leftOuter, topOuter, topMiddle, leftMiddle],

		[leftMiddle, topMiddle, topInner, leftInner],
		[topMiddle, rightMiddle, rightInner, topInner],
		[rightInner, rightMiddle, bottomMiddle, bottomInner],
		[leftMiddle, leftInner, bottomInner, bottomMiddle],
	]
}

export const p = (sw: number): IPts[] => {
	const bPts = b(sw)
	const maxX = pts2MaxX(bPts.flat())
	const midPt = bPts.flat().find((pt) => pt[0] === maxX)!

	return bPts.map((face) => mirrorPtsV(midPt[1], face))
}

export const q = (sw: number): IPts[] => {
	const pPts = p(sw)
	const centerX = pts2MaxX(pPts.flat()) / 2

	return p(sw).map((stroke) => mirrorPtsH(centerX, stroke))
}

export const r = (sw: number): IPts[] => {
	const sw2 = sw / 2
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const [cPts] = c(sw)
	const diagonalEndPt = translatePt([0, swD45], cPts[0])
	const diagonalPts = cPts.slice(0, 4).concat([diagonalEndPt])

	const topTip = pt(sw2, 1024 - sw2)
	const topTipLeft = pt(0, 1024)
	const topTipRight = pt(sw, 1024)
	const topTipInset = pt(sw2, 1024 + sw2)

	const bottomTip = pt(sw2, 2048)
	const bottomTipLeft = pt(sw, 2048 - sw2)
	const bottomTipRight = pt(0, 2048 - sw2)
	const bottomTipInset = pt(sw2, 2048 - sw)

	const [rightTipLeft, rightTip, rightTipRight] = diagonalPts.slice(1, 4)
	const rightTipInset = pt(rightTipLeft[0], rightTipRight[1])

	const upperDiagonalIntersection = pt(
		topTipRight[0],
		rightTipLeft[1] + (rightTipLeft[0] - topTipRight[0])
	)
	const middleDiagonalIntersection = pt(
		topTip[0],
		rightTip[1] + (rightTip[0] - topTip[0])
	)
	const lowerDiagonalIntersection = pt(
		topTipRight[0],
		rightTipRight[1] + (rightTipRight[0] - topTipRight[0])
	)

	return [
		[topTipLeft, topTip, topTipInset],
		[topTip, topTipRight, topTipInset],
		[
			topTipInset,
			topTipRight,
			upperDiagonalIntersection,
			middleDiagonalIntersection,
		],
		[
			middleDiagonalIntersection,
			upperDiagonalIntersection,
			rightTipLeft,
			rightTipInset,
		],
		[rightTipLeft, rightTip, rightTipInset],
		[rightTipInset, rightTip, rightTipRight],
		[
			middleDiagonalIntersection,
			rightTipInset,
			rightTipRight,
			lowerDiagonalIntersection,
		],
		[
			middleDiagonalIntersection,
			lowerDiagonalIntersection,
			bottomTipLeft,
			bottomTipInset,
		],
		[bottomTipInset, bottomTipLeft, bottomTip],
		[bottomTipRight, bottomTipInset, bottomTip],
		[topTipLeft, topTipInset, bottomTipInset, bottomTipRight],
	]
}

export const s = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const [cPts, _pts] = flatE(sw)

	// @todo replace with eGeometry (after adding that down the line)
	const diagonalUpper = cPts.slice(0, -3)
	const lowerCaseMidline = diagonalUpper[0][1]

	const diagonalLower = translatePts(
		[diagonalUpper[2][0], 0],
		mirrorPtsH(0, mirrorPtsV(lowerCaseMidline, diagonalUpper))
	)

	const maxX = pts2MaxX(_pts)
	const horizontalBound = maxX - sw / 2

	const dash = _pts.map(([x, y]) => {
		if (x >= horizontalBound) return pt(x - sw / 2, y)

		return pt(x, y)
	})

	const [_, topTipLeft, topTip, topTipRight] = diagonalUpper
	const topTipInset = pt(topTipLeft[0], topTipRight[1])

	const [bottomTipLeft, bottomTip, bottomTipRight] = diagonalLower.slice(
		1,
		-1
	)
	const bottomTipInset = pt(bottomTipLeft[0], bottomTipRight[1])

	const [
		leftTipLeft,
		leftTip,
		_leftTipRight,
		rightTipLeft,
		rightTip,
		_rightTipRight,
	] = dash

	const leftTipInset = translatePt([swD45 / 2, 0], leftTip)
	const rightTipInset = translatePt([-swD45 / 2, 0], rightTip)

	const upperDiagonalLowerIntersection = pt(
		topTipRight[0] - (rightTipLeft[1] - topTipRight[1]),
		rightTipLeft[1]
	)

	const lowerDiagonalUpperIntersection = pt(
		bottomTipRight[0] + (bottomTipRight[1] - leftTipLeft[1]),
		leftTipLeft[1]
	)

	return [
		// dash,

		[leftTip, topTipLeft, topTipInset, leftTipInset],

		[topTipLeft, topTip, topTipInset],
		[topTipInset, topTip, topTipRight],

		[
			leftTipInset,
			topTipInset,
			topTipRight,
			upperDiagonalLowerIntersection,
		],

		[
			leftTipInset,
			upperDiagonalLowerIntersection,
			rightTipLeft,
			rightTipInset,
		],

		[rightTipInset, rightTipLeft, rightTip],
		[bottomTipInset, rightTipInset, rightTip, bottomTipLeft],

		[bottomTip, bottomTipInset, bottomTipLeft],
		[bottomTipRight, bottomTipInset, bottomTip],
		[
			bottomTipRight,
			lowerDiagonalUpperIntersection,
			rightTipInset,
			bottomTipInset,
		],

		[
			leftTipLeft,
			leftTipInset,
			rightTipInset,
			lowerDiagonalUpperIntersection,
		],

		[leftTip, leftTipInset, leftTipLeft],
	]
}

export const t = (sw: number): IPts[] => {
	const lPts = l(sw)

	const sw2 = sw / 2
	const dashWidth = pts2MaxX(lPts.flat()) - sw2
	const [
		leftTipBottom,
		leftTip,
		leftTipTop,
		rightTipTop,
		rightTip,
		rightTipBottom,
	] = translatePtsX(sw2, horizontal(sw, dashWidth))

	const [rightTipInset] = translatePtsX(-sw, [rightTip])

	return lPts.concat([
		[leftTip, leftTipTop, rightTipTop, rightTipInset],
		[rightTipInset, rightTipTop, rightTip],
		[rightTipInset, rightTip, rightTipBottom],
		[leftTip, rightTipInset, rightTipBottom, leftTipBottom],
	])
}

export const u = (sw: number): IPts[] => {
	const [nPts] = flatN(sw)

	const left = vertical(sw, pts2MinY(nPts), 2048)
	const right = translatePtsX(pts2MaxX(nPts), left)

	const width = pts2MaxX(right) - pts2MinX(left) - sw

	const _ = translatePts([0, 1024 - sw], horizontal(sw, width))

	return [left, _, translatePtsX(-sw, right)]
}

export const v = (sw: number): IPts[] => {
	const [nPts] = flatN(sw)

	const midX = pts2MidX(nPts)
	const midY = pts2MidY(nPts)

	return [mirrorPtsH(midX, mirrorPtsV(midY, nPts))]
}

export const w = (sw: number): IPts[] => {
	return m(sw).map(mirrorPtsVOnCenter)
}

/** @todo +pts2MidX/Y */
export const x = (sw: number): IPts[] => {
	const sw2D45 = sw / Math.SQRT2 // half diagonal stroke width (@ 45 deg angle)

	const [cPts] = c(sw)

	const maxX = pts2MaxX(cPts)
	const midX = maxX / 2

	return [mirrorPtsH(midX, cPts), translatePtsX(maxX - sw2D45 * 3.5, cPts)]
}

export const y = (sw: number): IPts[] => {
	const [uPts] = v(sw)
	const [verticalPts, tailPts] = j(sw)

	const uMaxX = pts2MaxX(uPts)
	const jMaxX = pts2MaxX(verticalPts)

	const offsetX = uMaxX - jMaxX

	return [
		uPts,
		translatePtsX(offsetX, verticalPts),
		translatePtsX(offsetX, tailPts),
	]
}

export const z = (sw: number): IPts[] => {
	const sPts = s(sw)

	const midX = pts2MaxX(sPts.flat()) / 2

	return sPts.map((stroke) => mirrorPtsH(midX, stroke))
}
