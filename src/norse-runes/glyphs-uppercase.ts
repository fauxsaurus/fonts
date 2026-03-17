import {oldN} from './glyphs-lowercase'
import {gt, horizontal, tip, vertical} from './stroke-components'
import {
	pts2MaxX,
	pts2MinY,
	translatePts,
	translatePtsX,
	translatePtsY,
	type IPts,
} from './util'

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

export const N = (sw: number): IPts[] => {
	const [nPts] = oldN(sw)
	const formerMinY = pts2MinY(nPts)

	const newPts: IPts = [
		...translatePtsY(-formerMinY, [nPts[0], nPts[1]]), // diagonal top
		...nPts.slice(2, 5), // tip right
		...translatePtsY(-formerMinY, [nPts[5], nPts[6]]), // diagonal bottom
		...nPts.slice(6), // tip left
	]

	return [newPts]
}

export const P = (sw: number): IPts[] => {
	return [vertical(sw), translatePts([sw / 2, -1024 + sw / 2], gt(sw))]
}
