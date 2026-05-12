import {gt, horizontal, lt, tail, tip, vertical} from './stroke-components'
import {
	distanceBetweenPts,
	getBisectorYAtX,
	getYFromXOnLine,
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
	rotatePts,
	translatePt,
	translatePts,
	translatePtsX,
	translatePtsY,
	type IPts,
} from './util'

// @todo use this in `gt()` to simplify calculations?
const getLowercaseMidY = (sw: number) => c(sw)[0].find(([x]) => x === 0)![1]

export const a = (sw: number): IPts[] => {
	const oPts = o(sw)
	const [_, gtPts] = oPts

	const maxX = pts2MaxX(gtPts)
	const minY = pts2MinY(gtPts)
	const maxY = pts2MaxY(gtPts)

	const verticalPts = translatePts(
		[maxX - sw * 1.5, 0],
		vertical(sw, minY, maxY)
	)

	return oPts.concat([verticalPts])
}

export const b = (sw: number): IPts[] => {
	return [vertical(sw), translatePtsX(sw / 2, gt(sw))]
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
	const ltPts = lt(sw)

	const verticalPts = translatePtsX(pts2MaxX(ltPts) - sw / 2, vertical(sw))

	return [verticalPts, ltPts]
}

export const e = (sw: number): IPts[] => {
	const [cPts] = c(sw)

	const centerY = getLowercaseMidY(sw)
	const maxX = pts2MaxX(cPts)
	const dash = translatePtsY(centerY - 1024, horizontal(sw, maxX + sw / 2))

	return [cPts, dash]
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

export const h = (sw: number): IPts[] => [vertical(sw), n(sw)[0]]

export const i = (sw: number): IPts[] => {
	const dotMinY = 1024 - sw * 3.5
	const dotH = sw * 2

	const verticalMinY = 1024 - sw / 2

	return [
		vertical(sw, dotMinY, dotMinY + dotH),
		vertical(sw, verticalMinY),
		tail(sw),
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

	return [vertical(sw, minY, maxY), cPts]
}

export const l = (sw: number): IPts[] => {
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

	// faces
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
	const [nPts] = n(sw)

	const maxX = pts2MaxX(nPts)
	const reverseNPts = mirrorPtsH(maxX - sw / 2, nPts)

	return [nPts, reverseNPts]
}

export const n = (sw: number): IPts[] => {
	const sw2 = sw / 2 // half stroke width
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const gtPts = b(sw)[1]

	const maxX = pts2MaxX(gtPts)

	const minY = pts2MinY(gtPts)
	const maxY = pts2MaxY(gtPts)
	const midY = pts2MidY(gtPts)

	const leftVerticalPts = vertical(sw, minY, maxY)
	// denoted by cardinal directions
	const tipNWPts = leftVerticalPts.slice(0, 3)
	const tipSWPts = leftVerticalPts.slice(3)
	const tipSEPts = translatePtsX(maxX - sw, tipSWPts)

	// upper diagonal pts
	const rightOuter = pt(maxX, midY)

	/** @note the `topTipPt` shifted down by the width of a 45 degree diagonal */
	const leftTmp = translatePtsY(swD45, [pt(sw2, minY)])[0]

	const leftInner = pt(sw, getYFromXOnLine(leftTmp, 1, sw))
	const rightInner = pt(maxX - sw, getYFromXOnLine(leftTmp, 1, maxX - sw))

	return [
		[
			...tipNWPts,
			rightOuter,
			...tipSEPts,
			rightInner,
			leftInner,
			...tipSWPts,
		],
	]
}

/** @todo close up for a seamless shape  */
export const o = (sw: number): IPts[] => {
	const ltPts = lt(sw)
	const centerX = pts2MaxX(ltPts)

	return [ltPts, translatePtsX(centerX, gt(sw))]
}

export const p = (sw: number): IPts[] => {
	const sw2 = sw / 2

	const verticalMinY = 1024 - sw2
	const verticalMaxY = verticalMinY + 2048

	return [
		vertical(sw, verticalMinY, verticalMaxY),
		translatePtsX(sw2, gt(sw)),
	]
}

export const q = (sw: number): IPts[] => {
	const pPts = p(sw)
	const centerX = pts2MaxX(pPts.flat()) / 2

	return p(sw).map((stroke) => mirrorPtsH(centerX, stroke))
}

export const r = (sw: number): IPts[] => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const [cPts] = c(sw)
	const diagonalEndPt = translatePt([0, swD45], cPts[0])
	const diagonalPts = cPts.slice(0, 4).concat([diagonalEndPt])

	return [vertical(sw, 1024 - sw / 2, 2048), diagonalPts]
}

export const s = (sw: number): IPts[] => {
	const [cPts, _pts] = e(sw)

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

	return [diagonalUpper, diagonalLower, dash]
}

export const t = (sw: number): IPts[] => {
	const lPts = l(sw)

	return lPts.concat([horizontal(sw, pts2MaxX(lPts.flat()))])
}

export const u = (sw: number): IPts[] => {
	const [nPts] = n(sw)

	const left = vertical(sw, pts2MinY(nPts), 2048)
	const right = translatePtsX(pts2MaxX(nPts), left)

	const width = pts2MaxX(right) - pts2MinX(left) - sw

	const _ = translatePts([0, 1024 - sw], horizontal(sw, width))

	return [left, _, translatePtsX(-sw, right)]
}

export const v = (sw: number): IPts[] => {
	const [nPts] = n(sw)

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
