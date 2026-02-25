import {type JSX, useRef, useState} from 'react'

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

export const SVG = ({children, height = 2560, width = 2048}: IProps) => {
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
