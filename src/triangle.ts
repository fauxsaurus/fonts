import './App.css'

type IPt = {x: number; y: number}

/**
 * @returns A new point that is a specific distance away from a starting point (x,y) along a line defined by a known slope.
 */
const findPointOnLine = (
	x: number,
	y: number,
	distance: number,
	slope: number,
	direction: 1 | -1 = 1 // Multiplier to go forwards (1) or backwards (-1) along the line's angle. (defaults to forward)
): IPt => {
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
	pt0: IPt,
	pt1: IPt,
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
