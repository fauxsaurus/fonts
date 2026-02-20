// # Math
export type IPt = [number, number]

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

export const mirrorPtsH = (xAxis: number, pts: IPt[]) =>
	pts.map<IPt>(([x, y]) => [xAxis - x + xAxis, y])

export const mirrorPtsV = (yAxis: number, pts: IPt[]) =>
	pts.map<IPt>(([x, y]) => [x, yAxis - y + yAxis])

export const rotatePts = (degrees: number, [cx, cy]: IPt, pts: IPt[]) => {
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

export const translatePts = ([h, v]: IPt, ...pts: IPt[]) =>
	pts.map<IPt>(([x, y]) => [x + h, y + v])

// const getXFromYonLine = ([x1, y1]: IPt, m: number, y: number): number => {
// 	if (m) return x1 + (y - y1) / m // rearranged point-slope formula

// 	// prevent division by zero
// 	// If the slope is 0 (horizontal line), y will always be y1. If y2 is the same as y1, any x value is valid, but we return x1 as a reference.
// 	if (y === y1) return x1 // any x value is valid, but we return x1 as a reference.

// 	throw new Error('A horizontal line with y = y1 does not pass through y2.')
// }

// const getYFromXOnLine = ([x0, y0]: IPt, m: number, x: number) =>
// 	m * (x - x0) + y0

// Math.hypot(
// 			cShape.tipTopOuter[0] - cShape.centerOuter[0],
// 			cShape.tipTopOuter[1] - cShape.centerOuter[1]
// 		)
