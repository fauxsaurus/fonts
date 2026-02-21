import type {JSX} from 'react'

import React, {useRef, useState} from 'react'
import {
	lines2intersectionPt,
	mirrorPtsH,
	mirrorPtsV,
	pts2MaxX,
	pts2MaxY,
	rotatePts,
	translatePts,
	type IPt,
	type IPts,
} from './util'

const sw = 192 // stroke width
const sw2 = sw / 2 // offset width

const swD45 = (sw * 2) / Math.SQRT2 // diagonal stroke width (@ 45 deg angle)

type IProps = {
	children: JSX.Element | JSX.Element[]
	width?: number
	height?: number
}

// Define the shape of our coordinate point
interface Point {
	x: number
	y: number
}

const SVG = ({children, height = 2560, width = 2048}: IProps) => {
	const svgRef = useRef<SVGSVGElement>(null)
	const [svgCoords, setSvgCoords] = useState<Point>({x: 0, y: 0})

	const handleMouseMove = (event: React.PointerEvent<SVGSVGElement>) => {
		const svgElement = svgRef.current
		if (!svgElement) return

		// 1. Create a DOMPoint from the event coordinates
		// We use clientX/Y which are relative to the viewport
		const point = new DOMPoint(event.clientX, event.clientY)

		// 2. Get the Current Transformation Matrix (CTM) of the SVG
		// This matrix maps SVG units to Screen units.
		const screenCTM = svgElement.getScreenCTM()

		if (!screenCTM) return

		// 3. Invert the matrix to map Screen units -> SVG units
		const invertedMatrix = screenCTM.inverse()

		// 4. Apply the inverted matrix to our point
		const transformedPoint = point.matrixTransform(invertedMatrix)

		// Update state
		setSvgCoords({
			x: transformedPoint.x,
			y: transformedPoint.y,
		})
	}

	return (
		<div style={{display: 'inline-block', float: 'left'}}>
			<div
				style={{fontSize: '.3rem'}}
			>{`${svgCoords.x.toFixed(3)},${svgCoords.y.toFixed(3)}`}</div>

			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox={`-256 -256 ${width + 512} ${height + 512}`}
				width={width}
				height={height}
				style={{background: 'white'}}
				ref={svgRef}
				onPointerMove={handleMouseMove}
			>
				{children}
				<g stroke="red" stroke-width="10" opacity="0.5">
					<path d="M0,0 h2048"></path>
					<path d="M0,512 h2048" opacity="0.25"></path>
					<path d="M0,1024 h2048"></path>
					<path d="M0,1536 h2048" opacity="0.25"></path>
					<path d="M0,2048 h2048"></path>
					<path d="M0,2560 h2048" opacity="0.25"></path>
				</g>
			</svg>
		</div>
	)
}

const pts2svg = (pts: IPt[]) => pts.map((pt) => pt.join(',')).join(' ')

// # STROKES
const bVertical = (() => {
	const top: IPt = [sw2, 0]
	const topLeft: IPt = [0, sw2]
	const topRight: IPt = [sw, sw2]

	const bottom: IPt = [sw2, 2048]
	const bottomLeft: IPt = [0, 2048 - sw2]
	const bottomRight: IPt = [sw, 2048 - sw2]

	return {
		top,
		topLeft,
		topRight,
		bottom,
		bottomLeft,
		bottomRight,
		pts: [topLeft, top, topRight, bottomRight, bottom, bottomLeft] as IPt[],
	}
})()

const bTriangle = (() => {
	const center: IPt = [sw, 1024] // where the outer diagonal meets the center line of the glyph vertically

	const bottomOuter: IPt = [sw2, 2048]

	const topOuter = translatePts([-sw2, -sw2], center)[0]
	const topInner = translatePts([-sw2, swD45 - sw2], center)[0]

	const bottomInner = translatePts([0, -swD45], bottomOuter)[0]

	const centerOuter = lines2intersectionPt(bottomOuter, -1, topOuter, 1)

	const centerInner = lines2intersectionPt(topInner, 1, bottomInner, -1)

	return {
		topOuter,
		centerOuter,
		bottomOuter,
		bottomInner,
		centerInner,
		topInner,

		pts: [
			topOuter,
			centerOuter,
			bottomOuter,
			bottomInner,
			centerInner,
			topInner,
		] as IPt[],
	}
})()

const PTriangle = (() => {
	const pts = translatePts([0, -bTriangle.topOuter[1]], ...bTriangle.pts)

	const [
		topOuter,
		centerOuter,
		bottomOuter,
		bottomInner,
		centerInner,
		topInner,
	] = pts

	return {
		topOuter,
		centerOuter,
		bottomOuter,
		bottomInner,
		centerInner,
		topInner,

		pts,
	}
})()

const cShape = (() => {
	const [topRight, centerOuter] = translatePts(
		[bTriangle.centerOuter[0], 0],
		...mirrorPtsH(0, bTriangle.pts)
	)

	const originalTip: IPt[] = [
		bVertical.topLeft,
		bVertical.top,
		bVertical.topRight,
	]

	const centerInner = translatePts([sw * Math.SQRT2, 0], centerOuter)[0]

	const [tipTopOuter, tipTop, tipTopInner] = translatePts(
		[topRight[0], topRight[1] - sw2],
		...rotatePts(45, bVertical.topLeft, originalTip)
	)

	const [tipBottomOuter, tipBottom, tipBottomInner] = mirrorPtsV(
		2048,
		translatePts([0, 1024 + sw2], tipTopOuter, tipTop, tipTopInner)
	)

	const pts = [
		centerOuter,

		tipTopOuter,
		tipTop,
		tipTopInner,

		centerInner,

		tipBottomInner,
		tipBottom,
		tipBottomOuter,
	]

	return {
		centerOuter,

		tipTopOuter,
		tipTop,
		tipTopInner,

		centerInner,

		tipBottomInner,
		tipBottom,
		tipBottomOuter,

		pts,
	}
})()

// tips named after the cardinal directions in which they point

const tipN: IPts = [
	[0, 0],
	[sw2, -sw2],
	[sw, 0],
]

const tipNE: IPt[] = [
	[0, 0],
	[sw / Math.SQRT2, 0],
	[sw / Math.SQRT2, sw / Math.SQRT2],
]

const tipE: IPt[] = [
	[0, 0],
	[sw2, sw2],
	[0, sw],
]

const tipSE: IPt[] = [
	[0, 0],
	[sw / Math.SQRT2, 0],
	[sw / Math.SQRT2, -sw / Math.SQRT2],
]

const tipS: IPt[] = [
	[0, 0],
	[sw, 0],
	[sw2, sw2],
]

const tipW: IPt[] = mirrorPtsH(0, tipE)

const GLYPHS = {
	B: () => {
		return (
			<SVG width={512}>
				<g stroke="none" fill="#000">
					<path key="v" d={`M${pts2svg(bVertical.pts)}z`} />
					<path key="triU" d={`M${pts2svg(PTriangle.pts)}z`} />
					<path key="triL" d={`M${pts2svg(bTriangle.pts)}z`} />
				</g>
			</SVG>
		)
	},
	C: () => {
		const shape: IPt[] = [
			...translatePts([1024, 0], ...tipNE).reverse(),
			[0, 1024],
			...translatePts([1024, 2048], ...tipSE),
			[swD45, 1024],
		]

		return (
			<SVG width={1024}>
				<g stroke="none" fill="#000">
					<path key="<" d={`M${pts2svg(shape)}z`} />
				</g>
			</SVG>
		)
	},
	E: () => {
		const shape: IPt[] = [
			...translatePts([1024, 0], ...tipNE).reverse(),
			[0, 1024],
			...translatePts([1024, 2048], ...tipSE),
			[swD45, 1024],
		]

		const _Shape = translatePts([sw2, 1024 - sw2], ...tipW)
			.reverse()
			.concat(
				translatePts(
					[1024 + sw / Math.SQRT2 - sw2, 1024 - sw2],
					...tipE
				)
			)

		return (
			<SVG width={1024}>
				<g stroke="none" fill="#000">
					<path key="<" d={`M${pts2svg(shape)}z`} />

					<path key="-" d={`M${pts2svg(_Shape)}z`} />
				</g>
			</SVG>
		)
	},

	// @todo make g horizontal the same width as the f horizontal?
	G: () => {
		const CShape: IPts = [
			[1024, swD45],
			[1024, 0],

			[0, 1024],

			[1024, 2048],
			[1024, 2048 - swD45],

			[swD45, 1024],
		]

		const maxX = 1024

		const overHangTip = translatePts([maxX - sw, 1024 - sw * 2], ...tipS)

		const overHang: IPts = [
			[maxX, sw],
			[maxX - sw, sw],

			overHangTip[0],
			overHangTip[2],
			overHangTip[1],
		]

		const tipInnerMinX = swD45 + sw2 * 3
		const tipInner = translatePts([tipInnerMinX, 1024 - sw2], ...tipW)

		const _Shape: IPts = [
			...tipInner,
			[maxX, 1024 + sw2],
			[maxX, 1024 - sw2],
		]

		const vertical: IPts = [
			[maxX - sw, 1024],
			[maxX, 1024],

			[maxX, 2048 - sw],
			[maxX - sw, 2048 - sw],
		]

		return (
			<SVG width={1024}>
				<g stroke="none" fill="#000">
					<path key="<" d={`M${pts2svg(CShape)}z`} />
					<path key="\/" d={`M${pts2svg(overHang)}z`} />
					<path key="-" d={`M${pts2svg(_Shape)}z`} />
					<path key="|" d={`M${pts2svg(vertical)}z`} />
				</g>
			</SVG>
		)
	},
	P: () => {
		return (
			<SVG width={512}>
				<g stroke="none" fill="#000">
					<path key="v" d={`M${pts2svg(bVertical.pts)}z`} />
					<path key="triU" d={`M${pts2svg(PTriangle.pts)}z`} />
				</g>
			</SVG>
		)
	},
	// B: () => {
	// 	return (
	// 		<SVG width={512}>
	// 			<g stroke="none" fill="#000">
	// 				<path d={`M${pts2svg(bVertical.pts)}z`} />
	// 				<path d={`M${pts2svg(PTriangle.pts)}z`} />
	// 				<path d={`M${pts2svg(bTriangle.pts)}z`} />
	// 			</g>
	// 			<g fill="none" stroke="red" strokeWidth={10}>
	// 				<path d={`M${pts2svg(PTriangle.pts)}z`} />
	// 			</g>
	// 		</SVG>
	// 	)
	// },

	b: () => {
		return (
			<SVG width={512}>
				<g stroke="none" fill="#000">
					<path key="v" d={`M${pts2svg(bVertical.pts)}z`} />
					<path key="triL" d={`M${pts2svg(bTriangle.pts)}z`} />
				</g>
			</SVG>
		)
	},

	c: () => {
		return (
			<SVG width={512}>
				<g stroke="none" fill="#000">
					<path d={`M${pts2svg(cShape.pts)}Z`} />
				</g>
			</SVG>
		)
	},

	d: () => {
		const verticalPts = translatePts(
			[bTriangle.centerOuter[0] - sw, 0],
			...bVertical.pts
		)

		const trianglePts = translatePts(
			[bTriangle.centerOuter[0], 0],
			...mirrorPtsH(0, bTriangle.pts)
		)

		return (
			<SVG width={512}>
				<g stroke="none" fill="#000">
					<path key="v" d={`M${pts2svg(verticalPts)}z`} />
					<path key="tri" d={`M${pts2svg(trianglePts)}z`} />
				</g>
			</SVG>
		)
	},

	e: () => {
		const tipLeft = cShape.centerOuter
		const tipLeftTop = translatePts([sw2, -sw2], tipLeft)[0]
		const tipLeftBottom = translatePts([sw2, sw2], tipLeft)[0]

		const tipRightBottom = translatePts(
			[cShape.tipTop[0] - sw, 0],
			tipLeftBottom
		)[0]
		const tipRightTop = translatePts(
			[cShape.tipTop[0] - sw, 0],
			tipLeftTop
		)[0]
		const tipRight = translatePts([cShape.tipTop[0], 0], tipLeft)[0]

		const _Shape: IPt[] = [
			tipLeft,
			tipLeftTop,

			tipRightTop,
			tipRight,

			tipRightBottom,
			tipLeftBottom,
		]

		return (
			<SVG width={512}>
				<g stroke="none" fill="#000">
					<path key="c" d={`M${pts2svg(cShape.pts)}Z`} />
					<path key="_" d={`M${pts2svg(_Shape)}`} />
				</g>
			</SVG>
		)
	},

	f: () => {
		const verticalTipTop = translatePts([0, sw2], ...tipN)
		const verticalTipBottom = translatePts(
			[0, 2048 - sw2],
			...mirrorPtsV(0, tipN)
		).reverse()

		const vertical = verticalTipTop.concat(verticalTipBottom)

		const tailTip = translatePts(bTriangle.centerInner, ...tipNE)

		const tail: IPts = [
			...tailTip,
			verticalTipBottom[0],
			...translatePts([-swD45 / 2, -swD45 / 2], verticalTipBottom[0]),
		]

		const horizontal = translatePts(
			[pts2MaxX(tailTip) - sw2, 1024 - sw2],
			...tipE
		).concat([
			[0, 1024 + sw2],
			[0, 1024 - sw2],
		])

		return (
			<SVG width={512}>
				<g stroke="none" fill="#000">
					<path key="|" d={`M${pts2svg(vertical)}z`} />
					<path key="/" d={`M${pts2svg(mirrorPtsV(1024, tail))}z`} />
					<path key="-" d={`M${pts2svg(horizontal)}z`} />
				</g>
			</SVG>
		)
	},

	i: () => {
		const verticalTipTop = translatePts([0, 1024], ...tipN)
		const verticalTipBottom = translatePts(
			[0, 2048 - sw2],
			...mirrorPtsV(0, tipN)
		).reverse()

		const vertical = verticalTipTop.concat(verticalTipBottom)

		const dotTop = translatePts([0, 1024 - sw * 3], ...tipN)
		const dotBottom = translatePts(
			[0, 1024 - sw * 2],
			...mirrorPtsV(0, tipN)
		).reverse()

		const dot = dotTop.concat(dotBottom)

		const tailTip = translatePts(bTriangle.centerInner, ...tipNE)

		const tail: IPts = [
			...tailTip,
			verticalTipBottom[0],
			...translatePts([-swD45 / 2, -swD45 / 2], verticalTipBottom[0]),
		]

		return (
			<SVG width={512}>
				<g stroke="none" fill="#000">
					<path d={`M${pts2svg(dot)}z`} />
					<path d={`M${pts2svg(vertical)}z`} />
					<path d={`M${pts2svg(tail)}z`} />
				</g>
			</SVG>
		)
	},

	l: () => {
		const verticalTipTop = translatePts([0, sw2], ...tipN)
		const verticalTipBottom = translatePts(
			[0, 2048 - sw2],
			...mirrorPtsV(0, tipN)
		).reverse()

		const vertical = verticalTipTop.concat(verticalTipBottom)

		const tailTip = translatePts(bTriangle.centerInner, ...tipNE)

		const tail: IPts = [
			...tailTip,
			verticalTipBottom[0],
			...translatePts([-swD45 / 2, -swD45 / 2], verticalTipBottom[0]),
		]

		return (
			<SVG width={512}>
				<g stroke="none" fill="#000">
					<path d={`M${pts2svg(vertical)}z`} />
					<path d={`M${pts2svg(tail)}z`} />
				</g>
			</SVG>
		)
	},

	p: () => {
		const vertical = translatePts([0, 1024 - sw2], ...bVertical.pts)
		const triangle = translatePts([0, 0], ...bTriangle.pts)

		return (
			<SVG width={512}>
				<g stroke="none" fill="#000">
					<path key="v" d={`M${pts2svg(vertical)}z`} />
					<path key="tri" d={`M${pts2svg(triangle)}z`} />
				</g>
			</SVG>
		)
	},

	o: () => {
		const triLeftPts = translatePts(
			[bTriangle.centerOuter[0], 0],
			...mirrorPtsH(0, bTriangle.pts)
		)
		const triRightPts = translatePts(
			[bTriangle.centerOuter[0] - sw, 0],

			...bTriangle.pts
		)

		const width = Math.max(...triRightPts.map(([x]) => x))

		return (
			<SVG width={width}>
				<g stroke="none" fill="#000">
					<path key="tri-left" d={`M${pts2svg(triLeftPts)}z`} />
					<path key="tri-right" d={`M${pts2svg(triRightPts)}z`} />
				</g>
			</SVG>
		)
	},

	// @todo what should be done if o does not line up visually with E, G, or t's center line?
	t: () => {
		const verticalTipTop = translatePts([0, sw2], ...tipN)
		const verticalTipBottom = translatePts(
			[0, 2048 - sw2],
			...mirrorPtsV(0, tipN)
		).reverse()

		const vertical = verticalTipTop.concat(verticalTipBottom)

		const tailTip = translatePts(bTriangle.centerInner, ...tipNE)

		const tail: IPts = [
			...tailTip,
			verticalTipBottom[0],
			...translatePts([-swD45 / 2, -swD45 / 2], verticalTipBottom[0]),
		]

		const horizontal = translatePts(
			[pts2MaxX(tailTip) - sw2, 1024 - sw2],
			...tipE
		).concat([
			[0, 1024 + sw2],
			[0, 1024 - sw2],
		])

		return (
			<SVG width={512}>
				<g stroke="none" fill="#000">
					<path key="|" d={`M${pts2svg(vertical)}z`} />
					<path key="/" d={`M${pts2svg(tail)}z`} />
					<path key="-" d={`M${pts2svg(horizontal)}z`} />
				</g>
			</SVG>
		)
	},

	' ': () => {
		return <SVG width={512}>{[]}</SVG>
	},
}

export const SVGRunes = ({children = ''}: {children: string}) => {
	return children.split('').map((glyph) => {
		const fn = GLYPHS?.[glyph as keyof typeof GLYPHS] || GLYPHS[' ']

		return fn()
	})
}
