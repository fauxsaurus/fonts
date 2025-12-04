import './App.css'

type IPtOld = {x: number; y: number}

/**
 * @returns A new point that is a specific distance away from a starting point (x,y) along a line defined by a known slope.
 */
const findPointOnLine = (
	x: number,
	y: number,
	distance: number,
	slope: number,
	direction: 1 | -1 = 1 // Multiplier to go forwards (1) or backwards (-1) along the line's angle. (defaults to forward)
): IPtOld => {
	// Handle the vertical line case separately to avoid Math.atan(Infinity) issues
	if (!isFinite(slope)) {
		const xn = x
		const yn = y + distance * direction
		return {x: xn, y: yn}
	}

	// 1. Calculate the angle (theta) from the slope
	// Math.atan returns radians
	const theta: number = Math.atan(slope)

	// 2. Use trigonometry to find the change in coordinates (delta x, delta y)
	// The Z value is used as the hypotenuse
	const deltaX: number = distance * Math.cos(theta) * direction
	const deltaY: number = distance * Math.sin(theta) * direction

	// 3. Determine the coordinates of the new point
	const xn: number = x + deltaX
	const yn: number = y + deltaY

	return {x: xn, y: yn}
}

export const line2triangularTipCoords = (
	pt0: IPtOld,
	pt1: IPtOld,
	strokeWidth: number
) => {
	const run = pt1.x - pt0.x
	const rise = pt1.y - pt0.y

	const slope = rise / run
	const perpendicularSlope = -1 * (run / rise) // reciprocal

	// direction to extend line in the opposite direction
	const directionFlag = run !== 0 ? (run > -1 ? -1 : 1) : rise > -1 ? -1 : 1

	return [
		findPointOnLine(
			pt0.x,
			pt0.y,
			strokeWidth * Math.sqrt(3), // 30, 60, 90 triangle "height"
			slope,
			directionFlag
		),
		findPointOnLine(pt0.x, pt0.y, strokeWidth, perpendicularSlope, 1),
		findPointOnLine(pt0.x, pt0.y, strokeWidth, perpendicularSlope, -1),
	]
}

type IX = number
type IY = number
export type IPt = [IX, IY]

const pts2Slope = (pt0: IPt, pt1: IPt) => {
	const run = pt1[0] - pt0[0]
	const rise = pt1[1] - pt0[1]

	return rise / run
}

/** @note the if distance is negative, it will retrieve a prior pt on the line */
const getNextPt = ([x, y]: IPt, slope: number, distance: number): IPt => {
	const direction = distance > -1 ? 1 : -1
	const absDistance = Math.abs(distance)

	// edge case: vertical line (would cause issues with `Math.atan(Infinity)`)
	if (!isFinite(slope)) return [x, y + absDistance * direction]

	const theta = Math.atan(slope) // angle (in radians)

	const deltaX = absDistance * Math.cos(theta) * direction
	const deltaY = absDistance * Math.sin(theta) * direction

	return [x + deltaX, y + deltaY]
}

const getInterceptingSlope = (slope: number) => (slope ? -1 / slope : 0)

/**
 * Calculates two coordinate pairs on the angle bisector,
 * Z distance from the intersection point (B).
 *
 * @param ptA - The first point defining the angle (x, y).
 * @param ptB - The intersection point (vertex) of the angle (x, y).
 * @param ptC - The second point defining the angle (x, y).
 * @param distance - The desired distance from point B to the calculated points.
 * @returns An array containing two coordinate pairs: [P_forward, P_backward].
 */
const getAngleBisectorPoints = (
	ptA: IPt,
	ptB: IPt,
	ptC: IPt,
	distance: number
): [IPt, IPt] => {
	// vectors
	const v1: IPt = [ptA[0] - ptB[0], ptA[1] - ptB[1]]
	const v2: IPt = [ptC[0] - ptB[0], ptC[1] - ptB[1]]

	// normalize vectors
	const magnitude = (v: IPt): number => Math.sqrt(v[0] * v[0] + v[1] * v[1])
	const mag1 = magnitude(v1)
	const mag2 = magnitude(v2)

	// Check for zero-length vectors (A or C is same as B)
	if (mag1 === 0 || mag2 === 0)
		throw new Error(
			'Points A or C cannot be the same as the intersection point B.'
		)

	// Calculate unit vectors (u1 and u2)
	const u1: IPt = [v1[0] / mag1, v1[1] / mag1]
	const u2: IPt = [v2[0] / mag2, v2[1] / mag2]

	// bisecting vector
	// Summing the two unit vectors finds the exact middle direction.
	const v_bisect: IPt = [u1[0] + u2[0], u1[1] + u2[1]]

	// Find the magnitude of the bisecting vector
	const mag_bisect = magnitude(v_bisect)

	// Check if the bisecting vector is zero (A, B, C are collinear and angle is 180 degrees)
	if (mag_bisect === 0) {
		// Handle 180-degree case: The bisector is perpendicular to the line A-B-C.
		// We'll use the perpendicular of u1.
		const perp_u1: IPt = [-u1[1], u1[0]]

		const P_forward: IPt = [
			ptB[0] + distance * perp_u1[0],
			ptB[1] + distance * perp_u1[1],
		]
		const P_backward: IPt = [
			ptB[0] - distance * perp_u1[0],
			ptB[1] - distance * perp_u1[1],
		]

		return [P_forward, P_backward]
	}

	// Normalize the bisecting vector to get the final direction unit vector
	const u_final: IPt = [v_bisect[0] / mag_bisect, v_bisect[1] / mag_bisect]

	// Scale the vector by Z
	const v_final: IPt = [distance * u_final[0], distance * u_final[1]]

	// Calculate the two final points (P_forward and P_backward)
	const P_forward: IPt = [ptB[0] + v_final[0], ptB[1] + v_final[1]]
	const P_backward: IPt = [ptB[0] - v_final[0], ptB[1] - v_final[1]]

	return [P_forward, P_backward]
}

export const pts2glyphSegmentPts = (strokeWidth: number, pts: IPt[]) => {
	const eqTriangleHeight = (strokeWidth * Math.sqrt(3)) / 2
	const eqTriangleHalfWidth = strokeWidth / 2

	if (pts.length === 1) {
		const pt = pts[0]
		const [x, y] = pt

		const l = x - eqTriangleHalfWidth // left
		const r = x + eqTriangleHalfWidth // right

		const t = y - eqTriangleHeight // top
		const b = y + eqTriangleHeight // bottom

		return [
			{
				centerPt: pt,
				nextPt: [x, b],
				prevPt: [x, t],
				adjPts: [[l, y], [r, y]], // prettier-ignore
			},
		]
	}

	return pts.reduce((derivatives, pt, i, pts) => {
		let nextPt = pts[i + 1]
		let prevPt = pts[i - 1]

		const slope = nextPt ? pts2Slope(pt, nextPt) : pts2Slope(prevPt!, pt)

		// extend line by 30, 60, 90 triangle height
		if (!nextPt) nextPt = getNextPt(pt, slope, eqTriangleHeight)
		else if (!prevPt) prevPt = getNextPt(pt, slope, -eqTriangleHeight)

		// const interceptingSlope = getInterceptingSlope(slope)

		const adjPts = getAngleBisectorPoints(
			prevPt,
			pt,
			nextPt,
			eqTriangleHalfWidth
		)

		// const adjPts =
		// pts[i + 1] && pts[i - 1]
		// 	? getAngleBisectorPoints(
		// 			prevPt,
		// 			pt,
		// 			nextPt,
		// 			eqTriangleHalfWidth
		// 	  )
		// 	: ([
		// 			getNextPt(pt, interceptingSlope, -eqTriangleHalfWidth),
		// 			getNextPt(pt, interceptingSlope, eqTriangleHalfWidth),
		// 	  ] as [IPt, IPt])

		return derivatives.concat([{centerPt: pt, nextPt, prevPt, adjPts}])
	}, [] as {centerPt: IPt; nextPt: IPt; prevPt: IPt; adjPts: [IPt, IPt]}[])
}
