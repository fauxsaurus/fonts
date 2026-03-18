import {
	lines2intersectionPt,
	mirrorPtsH,
	mirrorPtsV,
	pt,
	pts2MaxX,
	pts2MinX,
	pts2MinY,
	rotatePts,
	translatePt,
	translatePts,
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

export const getLowercaseMidline = (sw: number) => {
	const sw2 = sw / 2

	const topOuter = pt(0, 1024 - sw2)
	const bottomOuter = pt(0, 2048)

	const centerOuter = lines2intersectionPt(bottomOuter, -1, topOuter, 1)

	return centerOuter[1]
}

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

/** @returns a horizontal line centered on the x-height of a glyph */
export const horizontal = (sw: number, w: number): IPts => {
	const sw2 = sw / 2
	const minY = 1024 - sw2

	const left = translatePts([0, minY], tip(sw, 270))
	const right = translatePts([w - sw2, minY], tip(sw, 90))

	return left.concat(right)
}

/** @note "<" shape */
export const lt = (sw: number): IPts => {
	const lobe = gt(sw)
	const maxX = pts2MaxX(lobe)

	return translatePtsX(maxX, mirrorPtsH(0, lobe))
}

export const tail = (sw: number, double = false): IPts => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const innerCenter = !double
		? gt(sw)[4]
		: translatePts([512, -512], [gt(sw)[4]])[0]

	const tailTip = translatePts(
		innerCenter,
		translatePtsX(sw / 2, tip(sw, 45))
	)

	// where tail meets the lower vertical tip
	const intersectionPt = pt(sw, 2048 - sw / 2)

	return [
		...tailTip,
		intersectionPt,
		translatePt([-swD45 / 2, -swD45 / 2], intersectionPt),
	]
}

/** @note remember, pt order can flip from left-to-right (ltr) to rtl (depending on degrees). */
export const tip = (sw: number, degrees = 0): IPts => {
	const sw2 = sw / 2

	const pts: IPts = [[0, sw2], [sw2, 0], [sw, sw2]] // prettier-ignore
	if (!degrees) return pts

	const rotatedPts = rotatePts(degrees, [0, 0], pts)

	const minX = pts2MinX(rotatedPts)
	const minY = pts2MinY(rotatedPts)

	return translatePts([0 - minX, 0 - minY], rotatedPts)

	// @todo fix floating pt errors?
}

export const vertical = (sw: number, minY = 0, maxY = 2048): IPts => {
	const tipPts = tip(sw)
	const sw2 = sw / 2

	const top = translatePtsY(minY, tipPts)
	const bottom = mirrorPtsV(sw2, tipPts).reverse()

	return top.concat(translatePtsY(maxY - sw, bottom))
}
