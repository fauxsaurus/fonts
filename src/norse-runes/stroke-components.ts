import {
	lines2intersectionPt,
	mirrorPtsH,
	mirrorPtsV,
	pt,
	pts2MaxX,
	translatePtsX,
	translatePtsY,
	type IPts,
} from './util'

/** @note LINES
 * ASCENDER LINE (top, Cap Height)
 * MIDLINE (lowercase top, x Height)
 * BASELINE (un-DESCENDed lowercase bottom)
 * DESCENDER LINE
 */

/** @note ">" shape */
export const gt = (sw: number): IPts => {
	const sw2 = sw / 2
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const topOuter = pt(0, 1024 - sw2)
	const topInner = pt(0, 1024 - sw2 + swD45)
	// @note the point where two 45 degree angle strokes meet is thicker--hence swD45
	const bottomInner = pt(0, 2048 - swD45)
	const bottomOuter = pt(0, 2048)

	const centerInner = lines2intersectionPt(topInner, 1, bottomInner, -1)
	const centerOuter = lines2intersectionPt(bottomOuter, -1, topOuter, 1)

	return [
		topOuter,
		centerOuter,
		bottomOuter,

		bottomInner,
		centerInner,
		topInner,
	]
}

/** @note "<" shape */
export const lt = (sw: number): IPts => {
	const lobe = gt(sw)
	const maxX = pts2MaxX(lobe)

	return translatePtsX(maxX, mirrorPtsH(0, lobe))
}

export const tip = (sw: number): IPts => {
	const sw2 = sw / 2

	return [[0, sw2], [sw2, 0], [sw, sw2]] // prettier-ignore
}

export const vertical = (sw: number, minY = 0, maxY = 2048): IPts => {
	const tipPts = tip(sw)
	const sw2 = sw / 2

	const top = translatePtsY(minY, tipPts)
	const bottom = mirrorPtsV(sw2, tipPts).reverse()

	return top.concat(translatePtsY(maxY - sw, bottom))
}
