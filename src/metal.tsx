type IX = number
type IY = number
type IPt = [IX, IY]

type IProps = {
	children: string
	config: {base: number; paths: Record<string, string[]>; strokeWidth: number}
}

const COLORS = 'red,lime,blue,magenta,yellow,cyan'.split(',')

const rotatePt = (centerPt: IPt, currentPt: IPt, radians: number) => {
	const cx = centerPt[0]
	const cy = centerPt[1]

	const tmpX = currentPt[0]
	const tmpY = currentPt[1]

	const cos = Math.cos(radians)
	const sin = Math.sin(radians)

	const newX = cx + (tmpX - cx) * cos - (tmpY - cy) * sin
	const newY = cy + (tmpX - cx) * sin - (tmpY - cy) * cos

	return [newX, newY]
}

const pts2vectors = (pt: IPt, nextPt: IPt) => {
	const h = nextPt[0] - pt[0]
	const v = nextPt[1] - pt[1]

	return {h, v}
}
const getIntersectionPoint = (
	x1: number,
	y1: number,
	h1: number,
	v1: number,
	x2: number,
	y2: number,
	h2: number,
	v2: number
): IPt => {
	const D = h1 * v2 - v1 * h2

	if (D === 0)
		throw new Error(
			'Lines are parallel or coincident; no unique intersection point.'
		)

	const t = ((x2 - x1) * v2 - (y2 - y1) * h2) / D

	const x = x1 + t * h1
	const y = y1 + t * v1

	return [x, y]
}

const stroke2pathPts = (strokeWidth: number, strokes: IPt[]) => {
	const offsetWidth = strokeWidth / 2

	type ICacheEntry = {
		centerPt: IPt
		vectors: {h: number; v: number}
		edges: [IPt, IPt]
		intersection: [IPt, IPt]
	}

	const cache = strokes.slice(0).reduce((cache, centerPt, i, pts) => {
		// @todo do something if pts.length === 1

		// if last, reuse prior vectors (since they will not have changed)
		const {h, v} =
			i < pts.length - 1
				? pts2vectors(centerPt, pts[i + 1])
				: cache[i - 1].vectors

		const tmpPt1: IPt = [centerPt[0] + offsetWidth, centerPt[1]]

		const angle = Math.atan2(v, h)

		// +/-90 deg (aka 1/2 PI) for perpendicularity to current slope
		const edge1 = rotatePt(centerPt, tmpPt1, angle - Math.PI / 2)
		const edge2 = rotatePt(centerPt, tmpPt1, angle + Math.PI / 2)
		const edges = [edge1, edge2] as [IPt, IPt]

		// first and last pts can reuse edges for intersection pts
		if (!i || i === pts.length - 1)
			return cache.concat([
				{centerPt, vectors: {h, v}, edges, intersection: edges},
			])

		const priorCacheEntry = cache[i - 1]
		const [x1, y1] = priorCacheEntry.edges[0]
		const {h: h1, v: v1} = priorCacheEntry.vectors

		const [x2, y2] = edges[0]

		const i1 = getIntersectionPoint(x1, y1, h1, v1, x2, y2, h, v)

		const [x3, y3] = priorCacheEntry.edges[1]
		const {h: h3, v: v3} = priorCacheEntry.vectors

		const [x4, y4] = edges[1]

		const i2 = getIntersectionPoint(x3, y3, h3, v3, x4, y4, h, v)

		return cache.concat([
			{centerPt, vectors: {h, v}, edges, intersection: [i1, i2]},
		])
	}, [] as ICacheEntry[])

	const firstPt = cache[0]
	const lastPt = cache.slice(-1)[0]

	const pointyStartPt = extendLineWithVector(
		firstPt.centerPt,
		firstPt.vectors.h * -1,
		firstPt.vectors.v * -1,
		offsetWidth
	)
	const pointyEndPt = extendLineWithVector(
		lastPt.centerPt,
		lastPt.vectors.h,
		lastPt.vectors.v,
		offsetWidth
	)

	// craft `<path>` pts: pointyStartPt, firstPt.edges, ...nonLastPt.intersection, lastPt.edges, pointyEndPt
	const relevantPts = cache.reduce(
		(relevantPts, cacheEntry) => {
			relevantPts.left.push(cacheEntry.intersection[0])
			relevantPts.right.push(cacheEntry.intersection[1])

			return relevantPts
		},
		{left: [] as IPt[], right: [] as IPt[]}
	)
	return [pointyStartPt]
		.concat(relevantPts.left)
		.concat([pointyEndPt])
		.concat(relevantPts.right.slice().reverse())
}

const Temp = (props: {strokes: IPt[]; strokeWidth: number}) => {
	const {strokes, strokeWidth} = props
	const pathPts = stroke2pathPts(strokeWidth, strokes)
		.map((pt) => pt.join(','))
		.join(' ')

	return (
		<>
			<svg
				viewBox="-200 -200 1400 1400"
				xmlns="http://www.w3.org/2000/svg"
				width={1000}
				height={1000}
				style={{background: '#eee', height: '30rem'}}
			>
				<path d={`M${pathPts}Z `} fill="silver" stroke="none" />
			</svg>
			<br />
		</>
	)
}

const extendLineWithVector = (
	[startX, startY]: IPt,
	dirH: number,
	dirV: number,
	distance: number
): IPt => {
	const magnitude = Math.sqrt(dirH * dirH + dirV * dirV)

	// Check if the magnitude is zero to avoid division by zero
	if (magnitude === 0) return [startX, startY]

	// 2. Normalize the direction vector to get a unit vector
	const unitH = dirH / magnitude
	const unitV = dirV / magnitude

	// 3. Calculate the new coordinates
	const newX = startX + unitH * distance
	const newY = startY + unitV * distance

	return [newX, newY]
}

export const Metal = (props: IProps) => {
	const {base, paths, strokeWidth} = props.config
	const height = base * 6
	const offsetWidth = strokeWidth / 2

	// distance to extend line for pointy equilateral triangle tips
	const eqTriangleHeight = (strokeWidth * Math.sqrt(3)) / 2

	const characters = props.children.split('')
	const characterCoords = paths2coordinates(base, paths)

	const tmp = characterCoords['G'][0]
	console.log(tmp)

	return (
		<>
			<Temp strokes={tmp} strokeWidth={strokeWidth}></Temp>
			{characters.map((character, i) => {
				const width = base * 3

				const characterStrokes = characterCoords[character]

				const fillPts = characterStrokes.map((strokeCoords) => {
					return strokeCoords.flatMap((pt, i, pts) => {
						const prevPt =
							pts[i - 1] ??
							extendLine(pts[i + 1], pt, eqTriangleHeight)
						const nextPt =
							pts[i + 1] ??
							extendLine(prevPt, pt, eqTriangleHeight)

						if (!i) {
							const adjPt1 = vector2pt(
								pt,
								vector2perpendicularVector(
									pts2vector(prevPt, pt)
								),
								offsetWidth
							)

							const adjPt2 = vector2pt(
								pt,
								vector2perpendicularVector(
									pts2vector(prevPt, pt)
								),
								-offsetWidth
							)

							return [prevPt, adjPt1, adjPt2]
						}

						if (i === pts.length - 1) {
							const adjPt1 = vector2pt(
								pt,
								vector2perpendicularVector(
									pts2vector(prevPt, pt)
								),
								offsetWidth
							)

							const adjPt2 = vector2pt(
								pt,
								vector2perpendicularVector(
									pts2vector(prevPt, pt)
								),
								-offsetWidth
							)
							return [adjPt1, adjPt2, nextPt]
						}

						// todo find adj pts for corners

						return [pt]
					})
				})

				const xs = Array.from(
					new Set(fillPts.flat().map((pt) => pt[0]))
				)
				const ys = Array.from(
					new Set(fillPts.flat().map((pt) => pt[1]))
				)

				const minX = Math.min(...xs)
				const maxX = Math.max(...xs)

				const minY = Math.min(...ys)
				const maxY = Math.max(...ys)

				return (
					<svg
						key={i}
						viewBox={`${0} ${0} ${
							maxX - minX || base * 3
						} ${height}`}
						xmlns="http://www.w3.org/2000/svg"
						width={maxX - minX || base * 3}
						height={height}
						style={{background: '#eee'}}
					>
						<g
							style={{fill: 'none', stroke: '#0009', strokeWidth}}
							transform={`translate(${Math.abs(minX)},${Math.abs(
								minY
							)})`}
						>
							{characterStrokes.map((strokeCoords, i) => {
								const svgCoords = strokeCoords
									.map(
										([x, y]) =>
											`${x + strokeWidth / 2},${
												y + strokeWidth / 2
											}`
									)
									.join(' ')
								return <path d={`M${svgCoords}`} key={i} />
							})}
						</g>
						<g
							transform={`translate(${Math.abs(minX)},${Math.abs(
								minY
							)})`}
						>
							{fillPts.map((linePts, i) => {
								return (
									<g key={i} style={{fill: COLORS[i]}}>
										{linePts.map((pt, ii) => (
											<circle
												key={ii}
												cx={pt[0]}
												cy={pt[1]}
												r={offsetWidth / 2}
											/>
										))}
									</g>
								)
							})}

							{/* {calculateStrokeOutline(
								linesCoords[0],
								strokeWidth
							).map((pt, i) => {
								return (
									<circle
										key={i}
										cx={pt[0]}
										cy={pt[1]}
										r={offsetWidth / 2}
										style={{fill: 'black'}}
									/>
								)
							})} */}

							<text
								x="0"
								y={strokeWidth * 1.5}
								style={{
									fontSize: strokeWidth * 2,
									stroke: 'black',
								}}
							>
								{character}
							</text>
						</g>
					</svg>
				)
			})}
		</>
	)
}

type IH = number
type IV = number
type IVector = [IH, IV]

/**
 * @param a - 1st point on line.
 * @param b - 2nd point on line.
 * @param distance - from point b to point c.
 * @returns point c
 */
const extendLine = (a: IPt, b: IPt, distance: number): IPt => {
	const vector: IVector = pts2vector(a, b) // b to a

	const magnitude = vector2magnitude(vector)
	if (!magnitude) throw new Error('Points A and B cannot be the same.')

	const unitVector: IVector = [vector[0] / magnitude, vector[1] / magnitude]
	const nextVector: IVector = [
		distance * unitVector[0],
		distance * unitVector[1],
	]

	return [b[0] + nextVector[0], b[1] + nextVector[1]]
}

const pts2vector = (a: IPt, b: IPt): IPt => [b[0] - a[0], b[1] - a[1]] // b to a

// vector2length
const vector2magnitude = (v: IVector): number =>
	Math.sqrt(v[0] * v[0] + v[1] * v[1])

const paths2coordinates = (
	base: number,
	paths: Record<string, string[]>
): Record<string, IPt[][]> => {
	const entries = Object.entries(paths).map(([character, stringCoords]) => {
		const lines = stringCoords.map((stringOfCoords) =>
			stringOfCoords
				.split(' ')
				.map(
					(coordPair) =>
						coordPair
							.split(',')
							.map((string) => parseFloat(string) * base) as IPt
				)
		)

		return [character, lines]
	})

	return Object.fromEntries(entries)
}

// Normalize a vector to unit length
const normalizeVector = (v: IVector): IVector => {
	const magnitude = vector2magnitude(v)
	return magnitude === 0 ? [0, 0] : [v[0] / magnitude, v[1] / magnitude]
}

// Find the perpendicular vector (rotated 90 degrees clockwise)
const vector2perpendicularVector = (v: IVector): IVector => [-v[1], v[0]]

// Find the intersection point of two line segments defined by (A1, A2) and (B1, B2).
// Returns null if parallel or non-intersecting.
const getIntersectionPt = (a1: IPt, a2: IPt, b1: IPt, b2: IPt): IPt => {
	const deltaX = [a1[0] - a2[0], b1[0] - b2[0]]
	const deltaY = [a1[1] - a2[1], b1[1] - b2[1]]

	// Determinant of the line segments (parallel check)
	const determinant = deltaX[0] * deltaY[1] - deltaY[0] * deltaX[1]
	if (determinant === 0) throw new Error('Lines are parallel.')

	const c = [a1[0] * a2[1] - a1[1] * a2[0], b1[0] * b2[1] - b1[1] * b2[0]]

	const x = (c[0] * deltaX[1] - c[1] * deltaX[0]) / determinant
	const y = (c[0] * deltaY[1] - c[1] * deltaY[0]) / determinant

	return [x, y]
}

const vector2pt = (
	startPoint: IPt,
	directionVector: IVector,
	distance: number
): IPt => {
	const normalizedDirection = normalizeVector(directionVector)

	return [
		startPoint[0] + normalizedDirection[0] * distance,
		startPoint[1] + normalizedDirection[1] * distance,
	]
}

/**
 * Calculates the intersection point of two infinite lines.
 * Based on Paul Bourke's algorithm.
 * @returns The intersection Point or null if lines are parallel/collinear.
 */
function findLineIntersection(p1: IPt, p2: IPt, p3: IPt, p4: IPt): IPt {
	const denom =
		(p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1])

	if (denom === 0) throw new Error('Lines are parallel or collinear')

	const ua =
		((p4[0] - p3[0]) * (p1[1] - p3[1]) -
			(p4[1] - p3[1]) * (p1[0] - p3[0])) /
		denom

	const ub =
		((p2[0] - p1[0]) * (p1[1] - p3[1]) -
			(p2[1] - p1[1]) * (p1[0] - p3[0])) /
		denom

	// Return the intersection point
	const intersectionX = p1[0] + ua * (p2[0] - p1[0])
	const intersectionY = p1[1] + ua * (p2[1] - p1[1])

	return [intersectionX, intersectionY]
}

/**
 * Calculates the two corner points where two thick line segments meet at a joint.
 *
 * @param p1 The start point of the first line segment.
 * @param p2 The common midpoint (joint) of the two segments.
 * @param p3 The end point of the second line segment.
 * @param thickness The thickness of the lines.
 * @returns An array of two intersection Points (inner and outer corners) or null if lines are parallel.
 */
function calculateThickLineCorners(
	p1: IPt,
	p2: IPt,
	p3: IPt,
	thickness: number
): IPt[] {
	const halfThickness = thickness / 2

	// 1. Calculate direction vectors for the two segments
	const v1: IPt = [p2[0] - p1[0], p2[1] - p1[1]]
	const v2: IPt = [p3[0] - p2[0], p3[1] - p2[1]]

	// 2. Calculate length and normalize vectors
	const len1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1])
	const len2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1])

	if (len1 === 0 || len2 === 0) throw new Error('Line lengths cannot be 0!')

	const u1: IPt = [v1[0] / len1, v1[1] / len1]
	const u2: IPt = [2, v2[1] / len2]

	// 3. Calculate the "left" normal vectors (perpendicular, length 1)
	const n1: IPt = [-u1[1], u1[0]]
	const n2: IPt = [-u2[1], u2[0]]

	// 4. Define points for the two pairs of offset lines near P2
	// The offset lines for L1 pass through P2 + n1 * halfThickness and P2 - n1 * halfThickness
	// The offset lines for L2 pass through P2 + n2 * halfThickness and P2 - n2 * halfThickness

	// Line 1 Left: defined by p2_L1_a and a point along direction u1
	const p2_L1_a: IPt = [
		p2[0] + n1[0] * halfThickness,
		p2[1] + n1[1] * halfThickness,
	]
	const p2_L1_b: IPt = [
		p2[0] - n1[0] * halfThickness,
		p2[1] - n1[1] * halfThickness,
	]

	// Line 2 Left: defined by p2_L2_a and a point along direction u2
	const p2_L2_a: IPt = [
		p2[0] + n2[0] * halfThickness,
		p2[1] + n2[1] * halfThickness,
	]
	const p2_L2_b: IPt = [
		p2[0] - n2[0] * halfThickness,
		p2[1] - n2[1] * halfThickness,
	]

	// 5. Calculate intersection points for the inner and outer boundaries
	// The "left" lines intersect, and the "right" lines intersect, regardless of turn direction.
	const corner1 = findLineIntersection(
		p2_L1_a,
		[p2_L1_a[0] + u1[0], p2_L1_a[1] + u1[1]],
		p2_L2_a,
		[p2_L2_a[0] + u2[0], p2_L2_a[1] + u2[1]]
	)
	const corner2 = findLineIntersection(
		p2_L1_b,
		[p2_L1_b[0] + u1[0], p2_L1_b[1] + u1[1]],
		p2_L2_b,
		[p2_L2_b[0] + u2[0], p2_L2_b[1] + u2[1]]
	)

	if (corner1 && corner2) return [corner1, corner2]
	// This case occurs if the lines are parallel (straight line).
	// The corners are simply the endpoints of the offset lines at P2.
	// You might want to handle this case differently, e.g., returning the p2_L1_a and p2_L1_b points.
	return [
		[p2_L1_a[0], p2_L1_a[1]],
		[p2_L1_b[0], p2_L1_b[1]],
	]
}

// // --- Example Usage ---
// const pointA: Point = { x: 10, y: 10 };
// const pointB: Point = { x: 50, y: 50 };
// const pointC: Point = { x: 10, y: 50 };
// const lineWidth: number = 10;

// const intersectionPoints = calculateThickLineCorners(pointA, pointB, pointC, lineWidth);

// if (intersectionPoints) {
//     console.log("Intersection Points:", intersectionPoints);
//     // Example output might be:
//     // Intersection Points: [ { x: 42.92893218813712, y: 57.07106781186288 }, { x: 57.07106781186288, y: 42.92893218813712 } ]
// } else {
//     console.log("Lines are parallel or invalid.");
// }
