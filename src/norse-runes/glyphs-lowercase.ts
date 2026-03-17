import {gt, horizontal, lt, tail, tip, vertical} from './stroke-components'
import {
	distanceBetweenPts,
	getBisectorYAtX,
	getYFromXOnLine,
	mirrorPtsH,
	mirrorPtsV,
	pt,
	pts2MaxX,
	pts2MaxY,
	pts2MidY,
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

	const verticalPts = translatePts([maxX - sw, 0], vertical(sw, minY, maxY))

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
	const dash = translatePtsY(centerY - 1024, horizontal(sw, maxX))

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

export const h = (sw: number): IPts[] => [vertical(sw), oldN(sw)[0]]

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

	return [verticalPts, tailPts, translatePtsX(maxX, dot)]
}

export const k = (sw: number): IPts[] => {
	const [cPts] = c(sw)

	const minY = pts2MinY(cPts)
	const maxY = pts2MaxY(cPts)

	return [vertical(sw, minY, maxY), cPts]
}

export const l = (sw: number): IPts[] => {
	return [vertical(sw), tail(sw)]
}

export const m = (sw: number): IPts[] => {
	const sw2 = sw / 2 // offset width

	const center: IPts = [
		[512 - sw2, 1024 + 256],
		[512 + sw2, 1024 + 256],

		...translatePts([512 - sw2, 2048 - sw2], tip(sw, 180)),
	]

	return [oldN(sw)[0], center]
}

export const n = (sw: number): IPts[] => {
	const sw2 = sw / 2 // offset width
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	/** @note used to calculate the right outer pt (intersection between the h curve) */
	const gtPts = b(sw)[1]
	const maxX = pts2MaxX(gtPts)
	const gtMidY = pts2MidY(gtPts)

	// tips
	const leftTipPts = translatePtsY(2048 - sw2, tip(sw, 180))
	const rightTipPts = translatePtsX(maxX - sw, leftTipPts)

	// upper diagonal pts
	const rightOuter = pt(maxX, gtMidY)
	const leftOuter = pt(0, getYFromXOnLine(rightOuter, 1, 0))

	/** @note the `leftOuter` shifted down by the width of a 45 degree diagonal */
	const leftTmp = translatePtsY(swD45, [leftOuter])[0]

	const leftInner = pt(sw, getYFromXOnLine(leftTmp, 1, sw))
	const rightInner = pt(maxX - sw, getYFromXOnLine(leftTmp, 1, maxX - sw))

	return [
		[
			leftOuter,
			rightOuter,
			...rightTipPts,
			rightInner,
			leftInner,
			...leftTipPts,
		],
	]
}

/** @deprecated */
export const oldN = (sw: number): IPts[] => {
	const sw2 = sw / 2 // offset width

	// ptOrder = right-to-left
	const tipL = translatePtsY(2048 - sw / 2, tip(sw, 180))
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

	return [diagonalUpper, diagonalLower, _pts]
}

export const t = (sw: number): IPts[] => {
	const lPts = l(sw)

	return lPts.concat([horizontal(sw, pts2MaxX(lPts.flat()))])
}

export const u = (sw: number): IPts[] => {
	const [nPts] = oldN(sw)
	const mirroredNPts = mirrorPtsH(512, mirrorPtsV(2048, nPts))

	const maxY = pts2MaxY(mirroredNPts)

	return [translatePtsY(2048 - maxY, mirroredNPts)]
}

/** @todo this could be simplified by making "m" a single path */
export const w = (sw: number): IPts[] => {
	const mirroredMPts = m(sw).map((stroke) =>
		mirrorPtsH(512, mirrorPtsV(2048, stroke))
	)

	const maxY = pts2MaxY(mirroredMPts.flat())

	return mirroredMPts.map((stroke) => translatePtsY(2048 - maxY, stroke))
}

/** @todo +pts2MidX/Y */
export const x = (sw: number): IPts[] => {
	const sw2D45 = sw / Math.SQRT2 // half diagonal stroke width (@ 45 deg angle)

	const [cPts] = c(sw)

	const maxX = pts2MaxX(cPts)
	const midX = maxX / 2

	return [mirrorPtsH(midX, cPts), translatePtsX(maxX - sw2D45 * 2, cPts)]
}

export const y = (sw: number): IPts[] => {
	const [uPts] = u(sw)
	const [verticalPts, tailPts] = j(sw)

	const offsetX = 1024 - pts2MaxX(verticalPts)

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
