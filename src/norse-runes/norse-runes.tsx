import type {ReactNode} from 'react'
import {pts2MaxX, pts2MaxY, type IPt} from './glyphs/util'
import {Font, type IFontProps} from '../font/'
import {WeatheredGeometryViewer} from './weathered-geometry-viewer'
import GeometryViewer from './geometry-viewer'
import {textProps2sizedGlyphs} from './text'

type GlyphInput<K extends string> = {
	letter: string
	size: number
	strokeWidth: number
	points: Record<K, [number, number]>
	ridges: K[][]
	outlines: K[][]
	faces: K[][]
	left: number
}

type ChamferedBoxOutput = {
	positions: Float32Array
	normals: Float32Array
	indices: Uint32Array
}

/* ─────────────────────────────────────────────
   Core: extrude glyph → same output as createChamferedBoxGeometry()
   ───────────────────────────────────────────── */
function createExtrudedGlyphGeometry<K extends string>(
	glyphs: GlyphInput<K>[],
	depth: number,
	chamfer: number = 0.04
): ChamferedBoxOutput {
	const verts: number[] = []
	const norms: number[] = []
	const idxs: number[] = []

	let vCount = 0

	const pushTri = (
		ax: number,
		ay: number,
		az: number,
		bx: number,
		by: number,
		bz: number,
		cx: number,
		cy: number,
		cz: number,
		nx: number,
		ny: number,
		nz: number
	) => {
		const base = vCount
		verts.push(ax, ay, az, bx, by, bz, cx, cy, cz)
		norms.push(nx, ny, nz, nx, ny, nz, nx, ny, nz)
		idxs.push(base, base + 1, base + 2)
		vCount += 3
	}

	const pushQuad = (
		ax: number,
		ay: number,
		az: number,
		bx: number,
		by: number,
		bz: number,
		cx: number,
		cy: number,
		cz: number,
		dx: number,
		dy: number,
		dz: number,
		nx: number,
		ny: number,
		nz: number
	) => {
		pushTri(ax, ay, az, bx, by, bz, cx, cy, cz, nx, ny, nz)
		pushTri(ax, ay, az, cx, cy, cz, dx, dy, dz, nx, ny, nz)
	}

	// Layout pass
	const offsets: number[] = []
	let cursorX = 0

	for (const glyph of glyphs) {
		offsets.push(cursorX)
		let minX = Infinity
		let maxX = -Infinity
		for (const name of Object.keys(glyph.points)) {
			const p = glyph.points[name]
			if (p[0] < minX) minX = p[0]
			if (p[0] > maxX) maxX = p[0]
		}
		const advance = maxX - minX + glyph.strokeWidth * 0.05
		cursorX += advance
	}

	const totalWidth = cursorX
	const globalOffset = -totalWidth / 2

	// Geometry pass
	glyphs.forEach((glyph, gi) => {
		const {points, faces, outlines, ridges} = glyph
		const offX = offsets[gi] + globalOffset

		const getXY = (name: string): [number, number] => {
			const p = points[name]
			if (!p)
				throw new Error(
					`Unknown point "${name}" in glyph "${glyph.letter}"`
				)
			return [p[0] + offX, p[1]]
		}

		// 1. Top & bottom caps
		for (const face of faces) {
			if (face.length < 3) continue
			const triCount = face.length - 2
			for (let i = 0; i < triCount; i++) {
				const [ax, ay] = getXY(face[0])
				const [bx, by] = getXY(face[i + 1])
				const [cx, cy] = getXY(face[i + 2])

				pushTri(ax, ay, depth, bx, by, depth, cx, cy, depth, 0, 0, 1)
				pushTri(cx, cy, 0, bx, by, 0, ax, ay, 0, 0, 0, -1)
			}
		}

		// 2. Outline walls
		for (const outline of outlines) {
			const n = outline.length
			for (let i = 0; i < n; i++) {
				const j = (i + 1) % n
				const [x0, y0] = getXY(outline[i])
				const [x1, y1] = getXY(outline[j])

				const ex = x1 - x0
				const ey = y1 - y0
				const len = Math.hypot(ex, ey) || 1
				const nx = ey / len
				const ny = -ex / len

				pushQuad(
					x0,
					y0,
					0,
					x1,
					y1,
					0,
					x1,
					y1,
					depth,
					x0,
					y0,
					depth,
					nx,
					ny,
					0
				)
			}
		}

		// 3. Ridge walls — FIXED: uses ridge[i], not outline?.[i]
		for (const ridge of ridges) {
			const n = ridge.length
			for (let i = 0; i < n; i++) {
				const j = (i + 1) % n
				const [x0, y0] = getXY(ridge[i]) // ← was: getXY(outline?.[i] ?? ridge[i])
				const [x1, y1] = getXY(ridge[j])

				const ex = x1 - x0
				const ey = y1 - y0
				const len = Math.hypot(ex, ey) || 1
				const nx = ey / len
				const ny = -ex / len

				pushQuad(
					x0,
					y0,
					0,
					x1,
					y1,
					0,
					x1,
					y1,
					depth,
					x0,
					y0,
					depth,
					nx,
					ny,
					0
				)
				pushQuad(
					x1,
					y1,
					0,
					x0,
					y0,
					0,
					x0,
					y0,
					depth,
					x1,
					y1,
					depth,
					-nx,
					-ny,
					0
				)
			}
		}

		// 4. Chamfer bands on outline rim
		if (chamfer > 0) {
			for (const outline of outlines) {
				const n = outline.length
				for (let i = 0; i < n; i++) {
					const j = (i + 1) % n
					const [x0, y0] = getXY(outline[i])
					const [x1, y1] = getXY(outline[j])

					const ex = x1 - x0
					const ey = y1 - y0
					const len = Math.hypot(ex, ey) || 1
					const ux = ex / len
					const uy = ey / len
					const nx = uy
					const ny = -ux
					const ix = -nx * chamfer
					const iy = -ny * chamfer

					pushQuad(
						x0,
						y0,
						0,
						x1,
						y1,
						0,
						x1 + ix,
						y1 + iy,
						chamfer,
						x0 + ix,
						y0 + iy,
						chamfer,
						nx * 0.7071,
						ny * 0.7071,
						-0.7071
					)

					pushQuad(
						x0 + ix,
						y0 + iy,
						depth - chamfer,
						x1 + ix,
						y1 + iy,
						depth - chamfer,
						x1,
						y1,
						depth,
						x0,
						y0,
						depth,
						nx * 0.7071,
						ny * 0.7071,
						0.7071
					)
				}
			}
		}
	})

	return {
		positions: new Float32Array(verts),
		normals: new Float32Array(norms),
		indices: new Uint32Array(idxs),
	}
}

const pts2svg = (pts: IPt[]) => pts.map((pt) => pt.join(',')).join(' ')

const Tmp2dSvgBasedShading = () => {
	return (
		<defs>
			<linearGradient
				id="css-grad-1"
				x1="0%"
				y1="0%"
				x2="0%"
				y2="4.5%"
				spreadMethod="repeat"
			>
				<stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
				<stop offset="66.67%" stopColor="#ffffff" stopOpacity="0" />
				<stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
			</linearGradient>

			<linearGradient
				id="css-grad-2"
				x1="0%"
				y1="0%"
				x2="0%"
				y2="2.5%"
				spreadMethod="repeat"
			>
				<stop offset="0%" stopColor="#000000" stopOpacity="0" />
				<stop offset="80%" stopColor="#000000" stopOpacity="0" />
				<stop offset="100%" stopColor="#000000" stopOpacity="0.03" />
			</linearGradient>

			<linearGradient
				id="css-grad-3"
				x1="0%"
				y1="0%"
				x2="0%"
				y2="1.2%"
				spreadMethod="repeat"
			>
				<stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
				<stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
				<stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
			</linearGradient>

			<pattern
				id="stacked-repeating-gradient"
				width="100%"
				height="100%"
				patternUnits="userSpaceOnUse"
			>
				<rect width="100%" height="100%" fill="silver" />
				<rect width="100%" height="100%" fill="url(#css-grad-1)" />
				<rect width="100%" height="100%" fill="url(#css-grad-2)" />
				<rect width="100%" height="100%" fill="url(#css-grad-3)" />
			</pattern>
		</defs>
	)
}

export const NorseRunes = (props: {
	children: ReactNode
	fontSize?: number
	strokeWidth?: number
	depth?: boolean
}) => {
	const {children = '', fontSize = 12, strokeWidth = 192} = props

	const normalizedChildren = (
		Array.isArray(children) ? children : [children]
	).map((child) =>
		typeof child === 'string'
			? Font({children: child, size: fontSize})
			: (child?.props as IFontProps)
	)

	const simplifiedData = textProps2sizedGlyphs(normalizedChildren, {
		strokeWidth,
	})

	const width = pts2MaxX(Object.values(simplifiedData.slice(-1)[0].points))

	const height = pts2MaxY(
		simplifiedData.map((letter) => Object.values(letter.points)).flat()
	)

	console.log(simplifiedData)

	if (props.depth) {
		const scaleFactor = fontSize! / 2048
		const sw2 = strokeWidth / 2
		const depth = sw2 * scaleFactor

		return (
			<GeometryViewer
				geometry={createExtrudedGlyphGeometry(simplifiedData, depth, 0)}
			/>
		)

		return <WeatheredGeometryViewer {...{data: simplifiedData, depth}} />
	}

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${width} ${height}`}
			{...{width, height}}
		>
			<Tmp2dSvgBasedShading />
			<g stroke="none">
				{simplifiedData.map((letter, i) => {
					return letter.outlines
						.concat(letter.faces)
						.map((ptNames, ii) => {
							const fill =
								ii === 0 ||
								(['i', ':'].includes(letter.letter) && i === 1)
									? `url(#stacked-repeating-gradient)`
									: undefined

							const pts = ptNames.map(
								(ptName) => letter.points[ptName]
							)

							return (
								<path
									key={`${i}:${letter}-stroke:${ii}`}
									d={`M${pts2svg(pts)}z`}
									data-glyph={letter.letter}
									// not zero index-based for legacy reasons
									data-stroke={ii + 1}
									{...{fill}}
								/>
							)
						})
				})}
			</g>
		</svg>
	)
}
