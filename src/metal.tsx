type IX = number
type IY = number
type IPt = [IX, IY]

type IProps = {
	children: string
	config: {base: number; paths: Record<string, string[]>; strokeWidth: number}
}

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

const strokes2Width = (strokesPts: IPt[]) => {
	const xs = strokesPts.map(([x]) => x).sort((a, b) => b - a)
	const maxX = xs[0]
	const minX = xs.slice(-1)[0]

	return maxX - minX
}

const Temp = (props: {glyphs: IPt[][][]; strokeWidth: number}) => {
	const {glyphs, strokeWidth} = props

	const glyphCache = glyphs.reduce((cache, strokes, i) => {
		const strokesCache = strokes.map((stroke) =>
			stroke2pathPts(strokeWidth, stroke)
		)

		const width = strokes2Width(strokesCache.flat())

		const {offset: priorOffset, width: priorMaxX} = cache[i - 1] ?? {
			offset: 0,
			width: 0,
		}
		const offset = priorOffset + priorMaxX + (i ? strokeWidth : 0)

		return cache.concat([{offset, width, pts: strokesCache}])
	}, [] as {offset: number; width: number; pts: IPt[][]}[])

	const xs = glyphCache
		.flatMap((cache) => {
			const pts = cache.pts.flat()

			const xs = pts.map(([x]) => x).sort((a, b) => b - a)

			return [xs.slice(-1)[0], xs[0]]
		})
		.sort((a, b) => b - a)

	const ys = glyphCache
		.flatMap((cache) => {
			const pts = cache.pts.flat()

			// const xs = pts.map(([x]) => x).sort((a, b) => b - a)
			const ys = pts.map(([_, y]) => y).sort((a, b) => b - a)

			return [ys.slice(-1)[0], ys[0]]
		})
		.sort((a, b) => b - a)

	const maxY = ys[0]
	const minY = ys.slice(-1)[0]

	const svgHeight = Math.ceil(maxY - minY) * 1.2

	const minX = xs.slice(-1)[0]

	const lastGlyph = glyphCache.slice(-1)[0]
	const svgWidth = Math.ceil(lastGlyph.offset + lastGlyph.width - minX)

	return (
		<>
			<svg
				viewBox={`${minX} ${minY} ${svgWidth} ${maxY}`}
				xmlns="http://www.w3.org/2000/svg"
				width={svgWidth}
				height={svgHeight}
				style={{background: '#eee'}}
			>
				<g fill="silver" stroke="none">
					{glyphCache.map((strokesCache, glyphI) => (
						<g
							key={`glyph-${glyphI}`}
							transform={`translate(${strokesCache.offset}, 0)`}
						>
							{strokesCache.pts.map((strokePts, strokeI) => {
								const pathPts = strokePts
									.map((pt) => pt.join(','))
									.join(' ')

								return (
									<path
										key={`stroke-${strokeI}`}
										d={`M${pathPts}Z `}
									/>
								)
							})}
						</g>
					))}
				</g>
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

	const words = 'Ghost Girl and'
	const tmp = words.split('').map((letter) => characterCoords[letter])

	const words2 = 'the Ghost Giant'
	const tmp2 = words2.split('').map((letter) => characterCoords[letter])

	return (
		<>
			<Temp glyphs={tmp} strokeWidth={strokeWidth}></Temp>
			<Temp glyphs={tmp2} strokeWidth={strokeWidth}></Temp>
		</>
	)
}

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
