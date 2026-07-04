import {dot, gt, horizontal, lt, tail, tip, vertical} from './stroke-components'
import {
	avgPts,
	mirrorPtsH,
	mirrorPtsV,
	mirrorPtsVOnCenter,
	objectMap,
	pt,
	pts2MaxX,
	pts2MaxY,
	pts2MidX,
	pts2MidY,
	pts2MinX,
	pts2MinY,
	returnWrapper,
	translatePt,
	translatePts,
	translatePtsX,
	translatePtsY,
} from './util'

import {
	e as flatE,
	b as flatB,
	n as flatN,
	o as oFlat,
} from './glyphs-lowercase-flat'

const ascenderLine = (sw: number) => 0
const midLine = (sw: number) => 1024 - sw / 2

const baseLine = (sw: number) => 2048

/** @todo confirm that this is accurate */
/** @returns the "top" (now bottom) of a b/d flipped upside-down around the center of the lobe when forming a p/q */
// const descenderLine = (sw: number) =>
// 	baseLine(sw) + (ascenderLine(sw) - midLine(sw))

const xHeight = (sw: number) => baseLine(sw) - midLine(sw)

// @todo use this in `gt()` to simplify calculations?
const getLowercaseMidY = (sw: number) => c(sw).tmp[0].find(([x]) => x === 0)![1]

export const a = (sw: number) => {
	const oPts = oFlat(sw)
	const [_, gtPts] = oPts

	const maxX = pts2MaxX(gtPts)
	const minY = pts2MinY(gtPts)
	const maxY = pts2MaxY(gtPts)

	const [
		topTipLeft,
		topTip,
		topTipRight,
		bottomTipLeft,
		bottomTip,
		bottomTipRight,
	] = translatePts([maxX - sw * 1.5, 0], vertical(sw, minY, maxY))

	const topTipInset = translatePt([0, sw], topTip)
	const bottomTipInset = translatePt([0, -sw], bottomTip)

	const {
		topOuter,
		topMiddle,
		topInner,

		bottomOuter,
		bottomMiddle,
		bottomInner,

		leftOuter,
		leftMiddle,
		leftInner,

		rightOuter,
		rightMiddle,
		rightInner,
	} = o(sw).points

	const upperLeftIntersection = pt(
		topTipLeft[0],
		topOuter[1] + (topTipLeft[0] - topOuter[0])
	)

	const upperMiddleIntersection = pt(
		topTip[0],
		topMiddle[1] + (topTip[0] - topMiddle[0])
	)

	const upperRightIntersection = pt(
		topTipRight[0],
		rightOuter[1] - (rightOuter[0] - topTipRight[0])
	)

	const lowerRightIntersection = pt(
		topTipRight[0],
		rightOuter[1] + (rightOuter[0] - topTipRight[0])
	)

	const lowerMiddleIntersection = pt(
		bottomTip[0],
		bottomMiddle[1] - (bottomTip[0] - bottomMiddle[0])
	)

	const lowerLeftIntersection = pt(
		bottomTipRight[0],
		bottomOuter[1] - (bottomTipRight[0] - bottomOuter[0])
	)

	return returnWrapper(
		[],
		// points
		{
			topOuter,
			topMiddle,
			topInner,

			bottomOuter,
			bottomMiddle,
			bottomInner,

			leftOuter,
			leftMiddle,
			leftInner,

			rightOuter,
			rightMiddle,
			rightInner,

			// lower vertical
			lowerLeftIntersection,
			bottomTipRight,
			bottomTip,
			bottomTipLeft,
			lowerRightIntersection,

			// top intersection
			upperRightIntersection,
			topTipRight,
			topTip,
			topTipLeft,
			upperLeftIntersection,

			topTipInset,
			upperMiddleIntersection,
			bottomTipInset,
			lowerMiddleIntersection,
		},
		// ridges
		[
			['leftMiddle', 'topMiddle', 'rightMiddle', 'bottomMiddle'],
			['topTipInset', 'upperMiddleIntersection'],
			['bottomTipInset', 'lowerMiddleIntersection'],
		],
		// outline
		[
			[
				'leftInner',
				'topInner',
				'rightInner',
				'bottomInner',
				'bottomOuter',

				// lower vertical
				'lowerLeftIntersection',
				'bottomTipRight',
				'bottomTip',
				'bottomTipLeft',
				'lowerRightIntersection',

				'rightOuter',

				// top intersection
				'upperRightIntersection',
				'topTipRight',
				'topTip',
				'topTipLeft',
				'upperLeftIntersection',

				'topOuter',
				'leftOuter',
				'bottomOuter',
				'bottomInner',
			],
		],
		//faces
		[
			// top left circle
			['leftOuter', 'topOuter', 'topMiddle', 'leftMiddle'],
			[
				'topOuter',
				'upperLeftIntersection',
				'upperMiddleIntersection',
				'topMiddle',
			],

			// # upper vertical
			[
				'topTipLeft',
				'topTipInset',
				'upperMiddleIntersection',
				'upperLeftIntersection',
			],
			['topTipLeft', 'topTip', 'topTipInset'],
			['topTip', 'topTipRight', 'topTipInset'],
			[
				'topTipInset',
				'topTipRight',
				'upperRightIntersection',
				'upperMiddleIntersection',
			],
			// # right corner
			[
				'upperMiddleIntersection',
				'upperRightIntersection',
				'rightOuter',
				'rightMiddle',
			],
			[
				'rightMiddle',
				'rightOuter',
				'lowerRightIntersection',
				'lowerMiddleIntersection',
			],
			// lower vertical
			[
				'lowerMiddleIntersection',
				'lowerRightIntersection',
				'bottomTipLeft',
				'bottomTipInset',
			],
			['bottomTipInset', 'bottomTipLeft', 'bottomTip'],
			['bottomTipInset', 'bottomTip', 'bottomTipRight'],
			[
				'lowerLeftIntersection',
				'lowerMiddleIntersection',
				'bottomTipInset',
				'bottomTipRight',
			],
			// rest of circle
			[
				'bottomMiddle',
				'lowerMiddleIntersection',
				'lowerLeftIntersection',
				'bottomOuter',
			],
			['leftOuter', 'leftMiddle', 'bottomMiddle', 'bottomOuter'],

			['leftMiddle', 'topMiddle', 'topInner', 'leftInner'],
			['topMiddle', 'rightMiddle', 'rightInner', 'topInner'],
			['rightInner', 'rightMiddle', 'bottomMiddle', 'bottomInner'],
			['leftMiddle', 'leftInner', 'bottomInner', 'bottomMiddle'],
		]
	)
}

/** @todo Make these point names orientation agnostic to reuse them on bdpq without issue (e.g., topTip suddenly referring to the bottom for p/q). */
export const b = (sw: number) => {
	const sw2D45 = sw / Math.SQRT2 // half diagonal stroke width (@ 45 deg angle)

	// vertical
	const [
		topTipLeft,
		topTip,
		topTipRight,
		bottomTipLeft,
		bottomTip,
		bottomTipRight,
	] = vertical(sw)

	const topTipInset = translatePt([0, sw], topTip)

	// loop
	const loop = translatePtsX(sw / 2, gt(sw))
	const maxX = pts2MaxX(loop)
	const rightOuter = loop.find((pt) => pt[0] === maxX)!
	const [rightMiddle] = translatePtsX(-sw2D45, [rightOuter])
	const [rightInner] = translatePtsX(-sw2D45, [rightMiddle])

	// intersections
	const upperOuterIntersection = pt(
		topTipRight[0],
		rightOuter[1] - (rightOuter[0] - topTipRight[0])
	)
	const upperMiddleIntersection = pt(
		topTip[0],
		rightMiddle[1] - (rightMiddle[0] - topTip[0])
	)
	const upperInnerIntersection = pt(
		topTipRight[0],
		rightInner[1] - (rightInner[0] - topTipRight[0])
	)

	const lowerInnerIntersection = pt(
		bottomTipLeft[0],
		rightInner[1] + (rightInner[0] - bottomTipLeft[0])
	)
	const lowerMiddleIntersection = pt(
		bottomTip[0],
		rightMiddle[1] + (rightMiddle[0] - bottomTip[0])
	)

	return returnWrapper(
		[],
		// points
		{
			upperInnerIntersection,
			lowerInnerIntersection,
			rightInner,
			rightOuter,
			bottomTip,
			bottomTipRight,

			topTipLeft,
			topTip,
			topTipRight,
			topTipInset,
			upperOuterIntersection,

			rightMiddle,

			upperMiddleIntersection,
			lowerMiddleIntersection,
		},
		// ridges
		[
			[
				'topTipInset',
				'lowerInnerIntersection',
				'rightInner',
				'upperMiddleIntersection',
			],
		],
		// outlines
		[
			[
				'upperInnerIntersection',
				'lowerInnerIntersection',
				'rightInner',
				'rightOuter',
				'bottomTip',
				'bottomTipRight',

				'topTipLeft',
				'topTip',
				'topTipRight',
				'upperOuterIntersection',

				'rightOuter',
				'rightMiddle',
				'rightInner',
			],
		],
		// faces
		[
			['topTipLeft', 'topTip', 'topTipInset'],
			['topTip', 'topTipRight', 'topTipInset'],
			[
				'topTipInset',
				'topTipRight',
				'upperOuterIntersection',
				'upperMiddleIntersection',
			],
			// loop (outer)
			[
				'upperMiddleIntersection',
				'upperOuterIntersection',
				'rightOuter',
				'rightMiddle',
			],
			[
				'rightMiddle',
				'rightOuter',
				'bottomTip',
				'lowerMiddleIntersection',
			],
			// vertical (left)
			['bottomTipRight', 'lowerMiddleIntersection', 'bottomTip'],
			[
				'topTipLeft',
				'topTipInset',
				'lowerMiddleIntersection',
				'bottomTipRight',
			],
			// loop (inner)
			[
				'upperMiddleIntersection',
				'rightMiddle',
				'rightInner',
				'upperInnerIntersection',
			],
			[
				'lowerInnerIntersection',
				'rightInner',
				'rightMiddle',
				'lowerMiddleIntersection',
			],
			[
				'upperMiddleIntersection',
				'upperInnerIntersection',
				'lowerInnerIntersection',
				'lowerMiddleIntersection',
			],
		]
	)
}

export const c = (sw: number) => {
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

	const points = {
		topTipLeft: topOuter,
		topTip: translatePt([sw2D45, 0], topOuter),
		topTipRight: translatePt([sw2D45, sw2D45], topOuter),
		topTipInset: translatePt([0, sw2D45], topOuter),

		centerLeft: outerCenter,
		centerMiddle: avgPts([outerCenter, innerCenter]),
		centerRight: innerCenter,

		bottomTipLeft: translatePt([sw2D45, -sw2D45], bottomOuter),
		bottomTip: translatePt([sw2D45, 0], bottomOuter),
		bottomTipRight: bottomOuter,
		bottomTipInset: translatePt([0, -sw2D45], bottomOuter),
	}

	return returnWrapper(
		[],
		points,
		// ridges
		[['topTipInset', 'centerMiddle', 'bottomTipInset']],
		// outline
		[
			[
				'centerLeft',

				'topTipLeft',
				'topTip',
				'topTipRight',

				'centerRight',

				'bottomTipLeft',
				'bottomTip',
				'bottomTipRight',
			],
		],
		// faces
		[
			// upper diagonal
			['centerLeft', 'topTipLeft', 'topTipInset', 'centerMiddle'],
			['topTipLeft', 'topTip', 'topTipInset'],
			['topTipInset', 'topTip', 'topTipRight'],
			['centerMiddle', 'topTipInset', 'topTipRight', 'centerRight'],
			// lower diagonal
			['centerMiddle', 'centerRight', 'bottomTipLeft', 'bottomTipInset'],
			['bottomTipInset', 'bottomTipLeft', 'bottomTip'],
			['bottomTipInset', 'bottomTip', 'bottomTipRight'],
			['centerLeft', 'centerMiddle', 'bottomTipInset', 'bottomTipRight'],
		]
	)
}

export const d = (sw: number) => {
	const {points, ridges, outlines, faces} = b(sw)
	const maxX = pts2MaxX(Object.values(points))
	const yAxis = maxX / 2

	return returnWrapper(
		[],
		// points
		objectMap(points, (pt) => mirrorPtsH(yAxis, [pt])[0]),
		ridges,
		outlines,
		faces
	)
}

export const e = (sw: number) => {
	const sw2 = sw / 2

	const {
		topTipLeft,
		topTip,
		topTipRight,
		topTipInset,

		centerLeft,
		centerMiddle,
		centerRight,

		bottomTipLeft,
		bottomTip,
		bottomTipRight,
		bottomTipInset,
	} = c(sw).points

	const dashTip = pt(topTip[0] + sw2, centerLeft[1])
	const dashTipLeft = pt(topTip[0], centerLeft[1] - sw2)
	const dashTipRight = pt(topTip[0], centerLeft[1] + sw2)
	const dashTipInset = pt(topTip[0] - sw2, centerLeft[1])

	const upperLeftDashIntersection = pt(centerRight[0] + sw2, dashTipLeft[1])
	const lowerLeftDashIntersection = pt(centerRight[0] + sw2, dashTipRight[1])

	return returnWrapper(
		[],
		// points
		{
			centerLeft,
			topTipLeft,
			topTip,
			topTipRight,
			upperLeftDashIntersection,
			dashTipLeft,
			dashTip,
			dashTipRight,
			lowerLeftDashIntersection,
			bottomTipLeft,
			bottomTip,
			bottomTipRight,

			topTipInset,
			centerMiddle,

			dashTipInset,
			bottomTipInset,
		},
		// ridges
		[
			['topTipInset', 'centerMiddle', 'bottomTipInset'],
			['centerMiddle', 'dashTipInset'],
		],
		// outline
		[
			[
				'centerLeft',
				'topTipLeft',
				'topTip',
				'topTipRight',
				'upperLeftDashIntersection',
				'dashTipLeft',
				'dashTip',
				'dashTipRight',
				'lowerLeftDashIntersection',
				'bottomTipLeft',
				'bottomTip',
				'bottomTipRight',
			],
		],
		[
			['topTipLeft', 'topTip', 'topTipInset'],
			['topTip', 'topTipRight', 'topTipInset'],

			['centerLeft', 'topTipLeft', 'topTipInset', 'centerMiddle'],
			[
				'centerMiddle',
				'topTipInset',
				'topTipRight',
				'upperLeftDashIntersection',
			],

			[
				'centerMiddle',
				'upperLeftDashIntersection',
				'dashTipLeft',
				'dashTipInset',
			],

			['dashTipInset', 'dashTipLeft', 'dashTip'],
			['dashTipInset', 'dashTip', 'dashTipRight'],

			[
				'centerMiddle',
				'dashTipInset',
				'dashTipRight',
				'lowerLeftDashIntersection',
			],

			[
				'centerMiddle',
				'lowerLeftDashIntersection',
				'bottomTipLeft',
				'bottomTipInset',
			],
			['centerLeft', 'centerMiddle', 'bottomTipInset', 'bottomTipRight'],

			['bottomTipInset', 'bottomTipLeft', 'bottomTip'],
			['bottomTipInset', 'bottomTip', 'bottomTipRight'],
		]
	)
}

export const f = (sw: number) => {
	const {points, ridges, outlines, faces} = t(sw)

	return returnWrapper(
		[],
		objectMap(points, (pt) => mirrorPtsV(1024, [pt])[0]),
		ridges,
		outlines,
		faces
	)
}

/** @todo update */
export const g = (sw: number) => {
	const qPts = q(sw).tmp

	const tailPts = tail(sw)

	const offsetX = pts2MaxX(qPts.flat()) - sw
	const offsetY = pts2MaxY(qPts.flat()) - sw / 2 - pts2MaxY(tailPts)

	return returnWrapper(
		qPts.concat([
			translatePts([offsetX, offsetY], mirrorPtsH(sw / 2, tailPts)),
		])
	)
}

/** @todo fix 2D shading (*if* necessary--3D will likely make it obsolete) */
export const h = (sw: number) => {
	const {points, ridges} = n(sw)

	// vertical
	const topTipLeft = pt(0, sw / 2)
	const topTip = pt(sw / 2, 0)
	const topTipRight = pt(sw, sw / 2)

	const topTipInset = translatePt([0, sw], topTip)

	const bottomTipRight = pt(sw, 2048 - sw / 2)
	const bottomTip = pt(sw / 2, 2048)
	const bottomTipLeft = pt(0, 2048 - sw / 2)

	const bottomTipInset = translatePt([0, -sw], bottomTip)

	// arch
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	// where the right side of the vertical meets the top of the diagonal
	const diagonalUpperLeft = pt(sw, points.diagonalLowerLeft[1] - swD45)

	const {
		diagonalTopRight,
		bottomRightDiagonalInset,

		rightTipRight,
		rightTip,
		rightTipLeft,
		diagonalLowerRight,
		diagonalLowerLeft,
		leftTipRight,
		leftTip,
		leftTipLeft,
	} = points

	const diagonalLeftMiddle = points.topTipInset

	return returnWrapper(
		[],
		//points
		{
			// @todo remove unused n points
			...points,

			topTipInset,
			diagonalUpperLeft,
			diagonalLeftMiddle,
			diagonalTopRight,
			bottomRightDiagonalInset,

			topTipLeft,
			topTip,
			topTipRight,

			bottomTipInset,
			bottomTipRight,
			bottomTip,
			bottomTipLeft,

			rightTipRight,
			rightTip,
			rightTipLeft,
			diagonalLowerRight,
			diagonalLowerLeft,
			leftTipRight,
			leftTip,
			leftTipLeft,
		},
		// ridges
		[['topTipInset'], ridges[0]],
		// outlines
		[
			[
				'topTipLeft',
				'topTip',
				'topTipRight',
				'diagonalUpperLeft',
				'diagonalTopRight',
				'rightTipRight', // wrong name
				'rightTip',
				'rightTipLeft', // wrong name
				'diagonalLowerRight',
				'diagonalLowerLeft',
				'leftTipRight', // wrong name
				'leftTip',
				'leftTipLeft',
			],
		],
		// faces
		[
			['topTipLeft', 'topTip', 'topTipInset'],
			['topTip', 'topTipRight', 'topTipInset'],

			[
				'topTipInset',
				'topTipRight',
				'diagonalUpperLeft',
				'diagonalLeftMiddle',
			],
			[
				'diagonalLeftMiddle',
				'diagonalUpperLeft',
				'diagonalTopRight',
				'bottomRightDiagonalInset',
			],
			[
				'bottomRightDiagonalInset',
				'diagonalTopRight',
				'rightTipRight', // wrong name from n
				'rightTipInset',
			],
			[
				'rightTipInset',
				'rightTipRight', // wrong name from n
				'rightTip',
			],
			['rightTipLeft', 'rightTipInset', 'rightTip'],
			[
				'diagonalLowerRight',
				'bottomRightDiagonalInset',
				'rightTipInset',
				'rightTipLeft',
			],
			[
				'diagonalLeftMiddle',
				'bottomRightDiagonalInset',
				'diagonalLowerRight',
				'diagonalLowerLeft',
			],
			[
				'diagonalLeftMiddle',
				'diagonalLowerLeft',
				'leftTipRight',
				'leftTipInset',
			],
			['leftTipInset', 'leftTipRight', 'leftTip'],
			['leftTipLeft', 'leftTipInset', 'leftTip'],
			['topTipLeft', 'topTipInset', 'leftTipInset', 'leftTipLeft'],
		]
	)
}

export const i = (sw: number) => {
	const dotGeometry = dot(sw)

	const verticalMinY = 1024 - sw / 2

	const geometry = l(sw).points

	const {
		bottomTip,
		bottomTipLeft,

		tailTip,
		tailTipLeft,
		tailTipRight,
		tailTipInset,

		upperTail_VerticalRight,
		tailMiddle_verticalMiddle,
	} = geometry

	const [topTip, topTipLeft, topTipRight, topTipInset] = translatePts(
		[0, verticalMinY],
		[
			geometry.topTip,
			geometry.topTipLeft,
			geometry.topTipRight,
			geometry.topTipInset,
		]
	)

	return returnWrapper(
		[],
		//points
		{
			...dotGeometry.points,

			topTipLeft,
			topTip,
			topTipRight,
			upperTail_VerticalRight,
			tailTipLeft,
			tailTip,
			tailTipRight,
			bottomTip,
			bottomTipLeft,

			topTipInset,
			tailMiddle_verticalMiddle,
			tailTipInset,
		},
		// ridges
		[
			dotGeometry.ridges[0],
			['topTipInset', 'tailMiddle_verticalMiddle', 'tailTipInset'],
		],
		// outlines
		[
			dotGeometry.outlines[0],
			[
				'topTipLeft',
				'topTip',
				'topTipRight',
				'upperTail_VerticalRight',
				'tailTipLeft',
				'tailTip',
				'tailTipRight',
				'bottomTip',
				'bottomTipLeft',
			],
		],
		// faces
		[
			...dotGeometry.faces,
			['topTipLeft', 'topTip', 'topTipInset'],
			['topTip', 'topTipRight', 'topTipInset'],

			[
				'topTipInset',
				'topTipRight',
				'upperTail_VerticalRight',
				'tailMiddle_verticalMiddle',
			],

			[
				'upperTail_VerticalRight',
				'tailTipLeft',
				'tailTipInset',
				'tailMiddle_verticalMiddle',
			],
			['tailTipLeft', 'tailTip', 'tailTipInset'],
			['tailTipInset', 'tailTip', 'tailTipRight'],
			[
				'tailMiddle_verticalMiddle',
				'tailTipInset',
				'tailTipRight',
				'bottomTip',
			],

			['bottomTipLeft', 'tailMiddle_verticalMiddle', 'bottomTip'],

			[
				'topTipLeft',
				'topTipInset',
				'tailMiddle_verticalMiddle',
				'bottomTipLeft',
			],
		]
	)
}

/** @todo update */
export const j = (sw: number) => {
	const [verticalPts, _ltPts, tailPts] = g(sw).tmp
	const [dot] = i(sw).tmp

	const maxX = pts2MaxX(verticalPts) - sw

	const strokes = [verticalPts, tailPts, translatePtsX(maxX, dot)]

	const minX = pts2MinX(strokes.flat())

	return returnWrapper(strokes.map((pts) => translatePtsX(-minX, pts)))
}

/** @todo update */
export const k = (sw: number) => {
	const [cPts] = c(sw).tmp

	const minY = pts2MinY(cPts)
	const maxY = pts2MaxY(cPts)

	return returnWrapper([
		translatePtsX(sw / 2, vertical(sw, minY, maxY)),
		cPts,
	])
}

export const l = (sw: number) => {
	// outline
	const topTipLeft = pt(0, sw / 2)
	const topTip = pt(sw / 2, 0)
	const topTipRight = pt(sw, sw / 2)

	// const bottomTipRight = pt(sw, 2048 - sw / 2)
	const bottomTip = pt(sw / 2, 2048)
	const bottomTipLeft = pt(0, 2048 - sw / 2)

	const [tailTipLeft, tailTip, tailTipRight] = tail(sw).filter(
		([x]) => x > sw
	)

	// inset
	const topTipInset = translatePt([0, sw], topTip)
	const tailTipInset = pt(tailTipLeft[0], tailTipRight[1])

	// intersections
	// upper tail diagonal intersecting the eastern vertical
	const upperTail_VerticalRight = pt(
		topTipRight[0],
		tailTipLeft[1] - (topTipRight[0] - tailTipLeft[0])
	)

	// center tail diagonal intersecting the central vertical
	const tailMiddle_verticalMiddle = pt(
		topTip[0],
		tailTip[1] - (topTip[0] - tailTip[0])
	)

	return returnWrapper(
		[],
		// points
		{
			topTipLeft,
			topTip,
			topTipInset,
			topTipRight,
			upperTail_VerticalRight,
			tailMiddle_verticalMiddle,

			tailTipLeft,
			tailTipInset,
			tailTip,
			tailTipRight,
			bottomTip,

			bottomTipLeft,
		},
		// ridges
		[['topTipInset', 'tailMiddle_verticalMiddle', 'tailTipInset']],
		// outlines
		[
			[
				'topTipLeft',
				'topTip',
				'topTipRight',
				'upperTail_VerticalRight',
				'tailTipLeft',
				'tailTip',
				'tailTipRight',
				'bottomTip',
				'bottomTipLeft',
			],
		],
		// faces
		[
			['topTipLeft', 'topTip', 'topTipInset'],
			['topTip', 'topTipRight', 'topTipInset'],

			[
				'topTipInset',
				'topTipRight',
				'upperTail_VerticalRight',
				'tailMiddle_verticalMiddle',
			],

			[
				'upperTail_VerticalRight',
				'tailTipLeft',
				'tailTipInset',
				'tailMiddle_verticalMiddle',
			],
			['tailTipLeft', 'tailTip', 'tailTipInset'],
			['tailTipInset', 'tailTip', 'tailTipRight'],
			[
				'tailMiddle_verticalMiddle',
				'tailTipInset',
				'tailTipRight',
				'bottomTip',
			],

			['bottomTipLeft', 'tailMiddle_verticalMiddle', 'bottomTip'],

			[
				'topTipLeft',
				'topTipInset',
				'tailMiddle_verticalMiddle',
				'bottomTipLeft',
			],
		]
	)
}

export const m = (sw: number) => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const geometry = n(sw).points

	const {
		topTipLeft: topLeftTipLeft,
		topTip: topLeftTip,
		diagonalTopRight: upperCenterTmp,

		diagonalLowerLeft: innerLeft,

		leftTip: lowerLeftTip,
		leftTipLeft: lowerLeftTipLeft,
		leftTipRight: lowerLeftTipRight,
	} = geometry

	const [upperCenter] = translatePts([-sw, -sw], [upperCenterTmp])

	const [lowerCenter] = translatePtsY(swD45, [upperCenter])

	const [
		topRightTipRight,
		topRightTip,

		bottomRightTip,
		bottomRightTipLeft,
		bottomRightTipRight,

		innerRight,
	] = mirrorPtsH(lowerCenter[0], [
		topLeftTipLeft,
		topLeftTip,

		lowerLeftTip,
		lowerLeftTipLeft,
		lowerLeftTipRight,

		innerLeft,
	])

	const {
		topTip,
		topTipLeft,
		topTipInset,

		leftTip,
		// wrong names in `n(sw).points`
		leftTipLeft: leftTipRight,
		leftTipRight: leftTipLeft,
		leftTipInset,

		// rightTip,
		// rightTipLeft,
		// rightTipRight,
		// rightTipInset,

		// diagonalTopRight,
		diagonalLowerLeft,
		// diagonalLowerRight,
		// bottomRightDiagonalInset,
	} = geometry

	const middleCenter = avgPts([upperCenter, lowerCenter])

	const outline = [
		topLeftTipLeft,
		topLeftTip,

		upperCenter,

		topRightTip,
		topRightTipRight,

		bottomRightTipLeft,
		bottomRightTip,
		bottomRightTipRight,

		innerRight,

		lowerCenter,

		innerLeft,

		lowerLeftTipRight,
		lowerLeftTip,
		lowerLeftTipLeft,
	]

	return returnWrapper([
		outline,

		// top left tip
		[topTipLeft, topTip, topTipInset],

		// upper \
		[topLeftTip, upperCenter, middleCenter, topTipInset],
		// upper /
		mirrorPtsH(lowerCenter[0], [
			topLeftTip,
			upperCenter,
			middleCenter,
			topTipInset,
		]),
		// right vertical
		mirrorPtsH(lowerCenter[0], [topTipLeft, topTip, topTipInset]),
		mirrorPtsH(lowerCenter[0], [
			topTipLeft,
			topTipInset,
			leftTipInset,
			leftTipRight,
		]),
		mirrorPtsH(lowerCenter[0], [leftTipRight, leftTipInset, leftTip]),
		mirrorPtsH(lowerCenter[0], [leftTipInset, leftTipLeft, leftTip]),
		mirrorPtsH(lowerCenter[0], [
			topTipInset,
			diagonalLowerLeft,
			leftTipLeft,
			leftTipInset,
		]),
		// lower /
		mirrorPtsH(lowerCenter[0], [
			topTipInset,
			middleCenter,
			lowerCenter,
			diagonalLowerLeft,
		]),
		// lower \
		[topTipInset, middleCenter, lowerCenter, diagonalLowerLeft],
		// left vertical
		[topTipInset, diagonalLowerLeft, leftTipLeft, leftTipInset],
		[leftTipInset, leftTipLeft, leftTip],
		[leftTipRight, leftTipInset, leftTip],
		[topTipLeft, topTipInset, leftTipInset, leftTipRight],
	])
}

export const n = (sw: number) => {
	const sw2 = sw / 2 // half stroke width
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const gtPts = flatB(sw)[1]

	const maxX = pts2MaxX(gtPts)

	const minY = pts2MinY(gtPts)

	const topTip = pt(sw2, minY)
	const topTipLeft = pt(0, minY + sw2)
	const topTipInset = pt(sw2, minY + swD45 / 2)

	const leftTip = pt(sw2, 2048)
	const leftTipLeft = pt(0, 2048 - sw2)
	const leftTipRight = pt(sw, 2048 - sw2)
	const leftTipInset = pt(sw2, 2048 - sw)

	const rightTip = pt(maxX - sw2, 2048)
	const rightTipLeft = pt(maxX - sw, 2048 - sw2)
	const rightTipRight = pt(maxX, 2048 - sw2)
	const rightTipInset = pt(maxX - sw2, 2048 - sw)

	const topLeft2rightDistance = maxX - topTip[0]
	const diagonalTopRight = pt(maxX, topTip[1] + topLeft2rightDistance)

	const diagonalLowerLeft = pt(sw, minY + sw2 + swD45)
	const diagonalLowerRight = pt(
		maxX - sw,
		diagonalLowerLeft[1] + (maxX - sw - diagonalLowerLeft[0])
	)

	const bottomRightDiagonalInset = avgPts([
		diagonalTopRight,
		diagonalLowerRight,
	])

	return returnWrapper(
		[],
		// points
		{
			topTipLeft,
			topTip,
			topTipInset,
			diagonalTopRight,
			bottomRightDiagonalInset,
			rightTipRight,
			rightTipInset,
			rightTip,
			rightTipLeft,
			diagonalLowerRight,
			diagonalLowerLeft,
			leftTipRight,
			leftTipInset,
			leftTip,
			leftTipLeft,
		},
		// ridges
		[
			[
				'leftTipInset',
				'topTipInset',
				'bottomRightDiagonalInset', // @todo is this the right pt?
				'rightTipInset',
			],
		],
		// outline
		[
			[
				'topTipLeft',
				'topTip',
				'diagonalTopRight',
				'rightTipRight', // wrong name
				'rightTip',
				'rightTipLeft', // wrong name
				'diagonalLowerRight',
				'diagonalLowerLeft',
				'leftTipRight', // wrong name
				'leftTip',
				'leftTipLeft', // wrong name
			],
		],
		// faces
		[
			['topTipLeft', 'topTip', 'topTipInset'],
			[
				'topTip',
				'diagonalTopRight',
				'bottomRightDiagonalInset',
				'topTipInset',
			],
			[
				'bottomRightDiagonalInset',
				'diagonalTopRight',
				'rightTipRight',
				'rightTipInset',
			],
			['rightTipInset', 'rightTipRight', 'rightTip'],
			['rightTipLeft', 'rightTipInset', 'rightTip'],
			[
				'diagonalLowerRight',
				'bottomRightDiagonalInset',
				'rightTipInset',
				'rightTipLeft',
			],
			[
				'topTipInset',
				'bottomRightDiagonalInset',
				'diagonalLowerRight',
				'diagonalLowerLeft',
			],
			[
				'topTipInset',
				'diagonalLowerLeft',
				'leftTipRight',
				'leftTipInset',
			],
			['leftTipInset', 'leftTipRight', 'leftTip'],
			['leftTipLeft', 'leftTipInset', 'leftTip'],
			['topTipLeft', 'topTipInset', 'leftTipInset', 'leftTipLeft'],
		]
	)
}

export const o = (sw: number) => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const ltPts = lt(sw)
	const centerX = pts2MaxX(ltPts)
	const maxX = centerX * 2

	const minY = pts2MinY(ltPts)
	const centerY = (2048 - minY) / 2 + minY

	// console.log(
	// 	'midline equals top of "o":',
	// 	midLine(sw) === topOuter[1],
	// 	midLine(sw),
	// 	topOuter[1]
	// )
	// console.log(
	// 	'midline equals maxX of "o":',
	// 	midLine(sw),
	// 	maxX,
	// 	midLine(sw) === maxX
	// )

	const points = {
		topOuter: pt(centerX, minY),
		topMiddle: pt(centerX, minY + swD45 / 2),
		topInner: pt(centerX, minY + swD45),

		bottomOuter: pt(centerX, 2048),
		bottomMiddle: pt(centerX, 2048 - swD45 / 2),
		bottomInner: pt(centerX, 2048 - swD45),

		leftOuter: pt(0, centerY),
		leftMiddle: pt(swD45 / 2, centerY),
		leftInner: pt(swD45, centerY),

		rightOuter: pt(maxX, centerY),
		rightMiddle: pt(maxX - swD45 / 2, centerY),
		rightInner: pt(maxX - swD45, centerY),
	}

	return returnWrapper(
		[],
		points,
		// ridges
		[['leftMiddle', 'topMiddle', 'rightMiddle', 'bottomMiddle']],
		// outline
		[
			[
				'leftInner',
				'topInner',
				'rightInner',
				'bottomInner',
				'bottomOuter',
				'rightOuter',
				'topOuter',
				'leftOuter',
				'bottomOuter',
				'bottomInner',
			],
		],
		// faces
		[
			['topOuter', 'rightOuter', 'rightMiddle', 'topMiddle'],
			['rightMiddle', 'rightOuter', 'bottomOuter', 'bottomMiddle'],
			['leftOuter', 'leftMiddle', 'bottomMiddle', 'bottomOuter'],
			['leftOuter', 'topOuter', 'topMiddle', 'leftMiddle'],

			['leftMiddle', 'topMiddle', 'topInner', 'leftInner'],
			['topMiddle', 'rightMiddle', 'rightInner', 'topInner'],
			['rightInner', 'rightMiddle', 'bottomMiddle', 'bottomInner'],
			['leftMiddle', 'leftInner', 'bottomInner', 'bottomMiddle'],
		]
	)
}

export const p = (sw: number) => {
	const bPts = b(sw).tmp
	const maxX = pts2MaxX(bPts.flat())
	const midPt = bPts.flat().find((pt) => pt[0] === maxX)!

	return returnWrapper(bPts.map((face) => mirrorPtsV(midPt[1], face)))
}

/** @todo update */
export const q = (sw: number) => {
	const pPts = p(sw).tmp
	const centerX = pts2MaxX(pPts.flat()) / 2

	return returnWrapper(p(sw).tmp.map((stroke) => mirrorPtsH(centerX, stroke)))
}

export const r = (sw: number) => {
	const sw2 = sw / 2
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const [cPts] = c(sw).tmp
	const diagonalEndPt = translatePt([0, swD45], cPts[0])
	const diagonalPts = cPts.slice(0, 4).concat([diagonalEndPt])

	const topTip = pt(sw2, 1024 - sw2)
	const topTipLeft = pt(0, 1024)
	const topTipRight = pt(sw, 1024)
	const topTipInset = pt(sw2, 1024 + sw2)

	const bottomTip = pt(sw2, 2048)
	const bottomTipLeft = pt(sw, 2048 - sw2)
	const bottomTipRight = pt(0, 2048 - sw2)
	const bottomTipInset = pt(sw2, 2048 - sw)

	const [rightTipLeft, rightTip, rightTipRight] = diagonalPts.slice(1, 4)
	const rightTipInset = pt(rightTipLeft[0], rightTipRight[1])

	const upperDiagonalIntersection = pt(
		topTipRight[0],
		rightTipLeft[1] + (rightTipLeft[0] - topTipRight[0])
	)
	const middleDiagonalIntersection = pt(
		topTip[0],
		rightTip[1] + (rightTip[0] - topTip[0])
	)
	const lowerDiagonalIntersection = pt(
		topTipRight[0],
		rightTipRight[1] + (rightTipRight[0] - topTipRight[0])
	)

	const outline = [
		topTipLeft,
		topTip,
		topTipRight,
		upperDiagonalIntersection,
		rightTipLeft,
		rightTip,
		rightTipRight,
		lowerDiagonalIntersection,
		bottomTipLeft,
		bottomTip,
		bottomTipRight,
	]

	return returnWrapper([
		outline,

		[topTipLeft, topTip, topTipInset],
		[topTip, topTipRight, topTipInset],
		[
			topTipInset,
			topTipRight,
			upperDiagonalIntersection,
			middleDiagonalIntersection,
		],
		[
			middleDiagonalIntersection,
			upperDiagonalIntersection,
			rightTipLeft,
			rightTipInset,
		],
		[rightTipLeft, rightTip, rightTipInset],
		[rightTipInset, rightTip, rightTipRight],
		[
			middleDiagonalIntersection,
			rightTipInset,
			rightTipRight,
			lowerDiagonalIntersection,
		],
		[
			middleDiagonalIntersection,
			lowerDiagonalIntersection,
			bottomTipLeft,
			bottomTipInset,
		],
		[bottomTipInset, bottomTipLeft, bottomTip],
		[bottomTipRight, bottomTipInset, bottomTip],
		[topTipLeft, topTipInset, bottomTipInset, bottomTipRight],
	])
}

export const s = (sw: number) => {
	const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

	const [cPts, _pts] = flatE(sw)

	// @todo replace with eGeometry (after adding that down the line)
	const diagonalUpper = cPts.slice(0, -3)
	const lowerCaseMidline = diagonalUpper[0][1]

	const diagonalLower = translatePts(
		[diagonalUpper[2][0], 0],
		mirrorPtsH(0, mirrorPtsV(lowerCaseMidline, diagonalUpper))
	)

	const maxX = pts2MaxX(_pts)
	const horizontalBound = maxX - sw / 2

	const dash = _pts.map(([x, y]) => {
		if (x >= horizontalBound) return pt(x - sw / 2, y)

		return pt(x, y)
	})

	const [_, topTipLeft, topTip, topTipRight] = diagonalUpper
	const topTipInset = pt(topTipLeft[0], topTipRight[1])

	const [bottomTipLeft, bottomTip, bottomTipRight] = diagonalLower.slice(
		1,
		-1
	)
	const bottomTipInset = pt(bottomTipLeft[0], bottomTipRight[1])

	const [
		leftTipLeft,
		leftTip,
		_leftTipRight,
		rightTipLeft,
		rightTip,
		_rightTipRight,
	] = dash

	const leftTipInset = translatePt([swD45 / 2, 0], leftTip)
	const rightTipInset = translatePt([-swD45 / 2, 0], rightTip)

	const upperDiagonalLowerIntersection = pt(
		topTipRight[0] - (rightTipLeft[1] - topTipRight[1]),
		rightTipLeft[1]
	)

	const lowerDiagonalUpperIntersection = pt(
		bottomTipRight[0] + (bottomTipRight[1] - leftTipLeft[1]),
		leftTipLeft[1]
	)

	const outline = [
		leftTip,
		topTipLeft,
		topTip,
		topTipRight,

		upperDiagonalLowerIntersection,
		rightTipLeft,

		rightTip,
		bottomTipLeft,
		bottomTip,
		bottomTipRight,

		lowerDiagonalUpperIntersection,
		leftTipLeft,
	]

	return returnWrapper([
		outline,

		// dash,

		[leftTip, topTipLeft, topTipInset, leftTipInset],

		[topTipLeft, topTip, topTipInset],
		[topTipInset, topTip, topTipRight],

		[
			leftTipInset,
			topTipInset,
			topTipRight,
			upperDiagonalLowerIntersection,
		],

		[
			leftTipInset,
			upperDiagonalLowerIntersection,
			rightTipLeft,
			rightTipInset,
		],

		[rightTipInset, rightTipLeft, rightTip],
		[bottomTipInset, rightTipInset, rightTip, bottomTipLeft],

		[bottomTip, bottomTipInset, bottomTipLeft],
		[bottomTipRight, bottomTipInset, bottomTip],
		[
			bottomTipRight,
			lowerDiagonalUpperIntersection,
			rightTipInset,
			bottomTipInset,
		],

		[
			leftTipLeft,
			leftTipInset,
			rightTipInset,
			lowerDiagonalUpperIntersection,
		],

		[leftTip, leftTipInset, leftTipLeft],
	])
}

export const t = (sw: number) => {
	const {points, ridges} = l(sw)

	const sw2 = sw / 2
	const dashWidth = pts2MaxX(Object.values(points)) - sw2
	const [
		leftTipBottom,
		leftTip,
		leftTipTop,
		rightTipTop,
		rightTip,
		rightTipBottom,
	] = translatePtsX(sw2, horizontal(sw, dashWidth))

	const [rightTipInset] = translatePtsX(-sw, [rightTip])

	return returnWrapper(
		[],
		// points
		{
			...points,

			leftTipTop,
			leftTip,
			rightTipTop,
			rightTipInset,
			rightTip,

			leftTipBottom,

			rightTipBottom,
		},
		// ridges
		[ridges[0], ['leftTip', 'rightTipInset']],
		// outlines
		[
			[
				'topTipLeft',
				'topTip',
				'topTipRight',
				'leftTipTop',
				'rightTipTop',
				'rightTip',
				'rightTipBottom',
				'leftTipBottom',
				'upperTail_VerticalRight',
				'tailTipLeft',
				'tailTip',
				'tailTipRight',
				'bottomTip',
				'bottomTipLeft',
			],
		],
		// faces
		[
			['topTipLeft', 'topTip', 'topTipInset'],
			['topTip', 'topTipRight', 'topTipInset'],

			['topTipInset', 'topTipRight', 'leftTipTop', 'leftTip'],

			['leftTip', 'leftTipTop', 'rightTipTop', 'rightTipInset'],

			['rightTipInset', 'rightTipTop', 'rightTip'],
			['rightTipInset', 'rightTip', 'rightTipBottom'],

			['leftTip', 'rightTipInset', 'rightTipBottom', 'leftTipBottom'],

			[
				'leftTip',
				'leftTipBottom',
				'upperTail_VerticalRight',
				'tailMiddle_verticalMiddle',
			],

			[
				'upperTail_VerticalRight',
				'tailTipLeft',
				'tailTipInset',
				'tailMiddle_verticalMiddle',
			],
			['tailTipLeft', 'tailTip', 'tailTipInset'],
			['tailTipInset', 'tailTip', 'tailTipRight'],
			[
				'tailMiddle_verticalMiddle',
				'tailTipInset',
				'tailTipRight',
				'bottomTip',
			],

			['bottomTipLeft', 'tailMiddle_verticalMiddle', 'bottomTip'],

			[
				'topTipLeft',
				'topTipInset',
				'tailMiddle_verticalMiddle',
				'bottomTipLeft',
			],
		]
	)
}

/** @todo update */
export const u = (sw: number) => {
	const [nPts] = flatN(sw)

	const left = vertical(sw, pts2MinY(nPts), 2048)
	const right = translatePtsX(pts2MaxX(nPts), left)

	const width = pts2MaxX(right) - pts2MinX(left) - sw

	const _ = translatePts([0, 1024 - sw], horizontal(sw, width))

	return returnWrapper([left, _, translatePtsX(-sw, right)])
}

/** @todo update */
export const v = (sw: number) => {
	const [nPts] = flatN(sw)

	const midX = pts2MidX(nPts)
	const midY = pts2MidY(nPts)

	return returnWrapper([mirrorPtsH(midX, mirrorPtsV(midY, nPts))])
}

/** @todo update */
export const w = (sw: number) => {
	return returnWrapper(m(sw).tmp.map(mirrorPtsVOnCenter))
}

/** @todo update */
/** @todo +pts2MidX/Y */
export const x = (sw: number) => {
	const sw2D45 = sw / Math.SQRT2 // half diagonal stroke width (@ 45 deg angle)

	const [cPts] = c(sw).tmp

	const maxX = pts2MaxX(cPts)
	const midX = maxX / 2

	return returnWrapper([
		mirrorPtsH(midX, cPts),
		translatePtsX(maxX - sw2D45 * 3.5, cPts),
	])
}

/** @todo update */
export const y = (sw: number) => {
	const [uPts] = v(sw).tmp
	const [verticalPts, tailPts] = j(sw).tmp

	const uMaxX = pts2MaxX(uPts)
	const jMaxX = pts2MaxX(verticalPts)

	const offsetX = uMaxX - jMaxX

	return returnWrapper([
		uPts,
		translatePtsX(offsetX, verticalPts),
		translatePtsX(offsetX, tailPts),
	])
}

/** @todo update */
export const z = (sw: number) => {
	const sPts = s(sw).tmp

	const midX = pts2MaxX(sPts.flat()) / 2

	return returnWrapper(sPts.map((stroke) => mirrorPtsH(midX, stroke)))
}
