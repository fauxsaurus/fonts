// # Math
export type IPt = [number, number]
export type IPts = IPt[]

/**
 * A simple function to centralize overhauls to the glyph return types.
 * @todo rename function
 * @param tmp
 * @param ridges
 * @param outlines
 * @param faces
 * @returns
 */
export const returnWrapper = <O extends Record<string, IPt>, K extends keyof O>(
	tmp: IPts[],
	points: O = {} as O,
	ridges: K[][] = [],
	outlines: K[][] = [],
	faces: K[][] = outlines
) => {
	/** @todo add outlines 3rd z coord as sw (make that the first param or upstream that to the glyphs themselves? Nah, do it here to reduce unnecessary complexity upstream) */

	return {tmp, points, ridges, outlines, faces}
}

export const avgPts = (pts: IPts) => {
	const sum = pts.reduce(
		(sum, pt) => {
			sum[0] += pt[0]
			sum[1] += pt[1]
			return sum
		},
		pt(0, 0)
	)

	return pt(sum[0] / pts.length, sum[1] / pts.length)
}

export const distanceBetweenPts = (a: IPt, b: IPt) =>
	Math.hypot(b[0] - a[0], b[1] - a[1])

export const lines2intersectionPt = (
	[x1, y1]: IPt,
	m1: number,
	[x2, y2]: IPt,
	m2: number
): IPt => {
	if (m1 === m2) throw new Error('Lines are parallel, no intersection!')

	const x = (m2 * x2 - m1 * x1 + y1 - y2) / (m2 - m1)
	const y = m1 * (x - x1) + y1

	return [x, y]
}

export const mirrorPtsH = (xAxis: number, pts: IPts) =>
	pts.map<IPt>(([x, y]) => [xAxis - x + xAxis, y])

export const mirrorPtsV = (yAxis: number, pts: IPts) =>
	pts.map<IPt>(([x, y]) => [x, yAxis - y + yAxis])

export const mirrorPtsHOnCenter = (pts: IPts): IPts =>
	mirrorPtsH(pts2MidX(pts), pts)

export const mirrorPtsVOnCenter = (pts: IPts): IPts =>
	mirrorPtsV(pts2MidY(pts), pts)

export const rotatePts = (degrees: number, [cx, cy]: IPt, pts: IPts) => {
	const angleInRadians = (degrees * Math.PI) / 180
	const cos = Math.cos(angleInRadians)
	const sin = Math.sin(angleInRadians)

	return pts.map<IPt>(([x, y]) => {
		// Translate the point to the origin
		const dx = x - cx
		const dy = y - cy

		// Apply the rotation
		const newX = dx * cos - dy * sin
		const newY = dx * sin + dy * cos

		// Translate the point back to the original center
		const rotatedX = newX + cx
		const rotatedY = newY + cy

		return [rotatedX, rotatedY]
	})
}

export const pt = (x: number, y: number): IPt => [x, y]

export const pts2MaxX = (pts: IPts) => Math.max(...pts.map(([x]) => x))
export const pts2MaxY = (pts: IPts) => Math.max(...pts.map(([_, y]) => y))

export const pts2MinX = (pts: IPts) => Math.min(...pts.map(([x]) => x))
export const pts2MinY = (pts: IPts) => Math.min(...pts.map(([_, y]) => y))

export const pts2MidX = (pts: IPts) => {
	const min = pts2MinX(pts)
	const max = pts2MaxX(pts)

	return (max - min) / 2 + min
}

export const pts2MidY = (pts: IPts) => {
	const min = pts2MinY(pts)
	const max = pts2MaxY(pts)

	return (max - min) / 2 + min
}

export const translatePts = ([h, v]: IPt, pts: IPts) =>
	pts.map<IPt>(([x, y]) => [x + h, y + v])

export const translatePt = ([h, v]: IPt, pt: IPt) =>
	translatePts([h, v], [pt])[0]

export const translatePtsX = (h: number, pts: IPts) => translatePts([h, 0], pts)
export const translatePtsY = (v: number, pts: IPts) => translatePts([0, v], pts)

// const getXFromYonLine = ([x1, y1]: IPt, m: number, y: number): number => {
// 	if (m) return x1 + (y - y1) / m // rearranged point-slope formula

// 	// prevent division by zero
// 	// If the slope is 0 (horizontal line), y will always be y1. If y2 is the same as y1, any x value is valid, but we return x1 as a reference.
// 	if (y === y1) return x1 // any x value is valid, but we return x1 as a reference.

// 	throw new Error('A horizontal line with y = y1 does not pass through y2.')
// }

export const getYFromXOnLine = ([x0, y0]: IPt, m: number, x: number) =>
	m * (x - x0) + y0

// @note used to get the coordinates of an interior angle at a non 90 or 45 degree angle
export const getBisectorYAtX = (
	[ax, ay]: IPt,
	[bx, by]: IPt,
	[cx, cy]: IPt,
	x: number
) => {
	// Vector BA
	let vBAx = ax - bx
	let vBAy = ay - by

	// Vector BC
	let vBCx = cx - bx
	let vBCy = cy - by

	// Normalize BA
	const magBA = Math.hypot(vBAx, vBAy)
	vBAx /= magBA
	vBAy /= magBA

	// Normalize BC
	const magBC = Math.hypot(vBCx, vBCy)
	vBCx /= magBC
	vBCy /= magBC

	// Add the normalized vectors (angle bisector direction)
	let bisectorX = vBAx + vBCx
	let bisectorY = vBAy + vBCy

	// Normalize the bisector
	const magBisector = Math.hypot(bisectorX, bisectorY)
	if (magBisector === 0)
		throw new Error('Points are collinear; angle bisector undefined.')

	bisectorX /= magBisector
	bisectorY /= magBisector

	return getYFromXOnLine([bx, by], bisectorY / bisectorX, x)
}

/**
 * @note stretches lowercase glyphs into uppercase height
 * @param threshold everything above this line will move upward
 * @param offset amount to move selected pts upward
 * @param strokes
 * @returns adjusted points
 */
export const stretchStrokesUpward = (
	threshold: number,
	offset: number,
	strokes: IPts[]
) =>
	strokes.map((stroke) =>
		stroke.map((pt) => {
			if (pt[1] >= threshold) return pt

			return translatePtsY(offset, [pt])[0]
		})
	)
