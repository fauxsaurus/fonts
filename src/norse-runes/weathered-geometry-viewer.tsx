import React, {useEffect, useRef} from 'react'
import * as THREE from 'three'

export type IPt = [number, number]
export type IPts = IPt[]

export interface WrapperResult<
	O extends Record<string, IPt> = Record<string, IPt>,
	K extends keyof O = keyof O,
> {
	points: O
	ridges: K[][]
	outlines: K[][]
	faces: K[][]
	tmp: IPts[]
}

export interface WeatheredGeometryViewerProps {
	/** Array of returnWrapper geometry objects passed via attribute/prop */
	data: WrapperResult[]
	/** Configurable 3rd Z coordinate for points in ridges (default: 50) */
	depth?: number
}

/**
 * Procedurally generates a weathered/hammered silver texture canvas map.
 */
function createWeatheredTexture(): THREE.CanvasTexture {
	const canvas = document.createElement('canvas')
	const size = 512
	canvas.width = size
	canvas.height = size
	const ctx = canvas.getContext('2d')!

	ctx.fillStyle = '#777'
	ctx.fillRect(0, 0, size, size)

	for (let i = 0; i < 3000; i++) {
		const x = Math.random() * size
		const y = Math.random() * size
		const r = Math.random() * 8 + 1

		const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
		grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)')
		grad.addColorStop(0.8, 'rgba(100, 100, 100, 0.1)')
		grad.addColorStop(1, 'rgba(255, 255, 255, 0.2)')

		ctx.fillStyle = grad
		ctx.beginPath()
		ctx.arc(x, y, r, 0, Math.PI * 2)
		ctx.fill()
	}

	const texture = new THREE.CanvasTexture(canvas)
	texture.wrapS = THREE.RepeatWrapping
	texture.wrapT = THREE.RepeatWrapping
	return texture
}

export const WeatheredGeometryViewer: React.FC<
	WeatheredGeometryViewerProps
> = ({data, depth = 50}) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		if (!canvasRef.current || !containerRef.current) return

		const canvas = canvasRef.current
		const renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true,
		})
		renderer.setClearColor(0x000000, 0) // Transparent background
		renderer.toneMapping = THREE.ACESFilmicToneMapping

		const scene = new THREE.Scene()

		// Orthographic camera to eliminate perspective distortion
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1000, 10000)

		// 1. Lighting Setup (50% global ambient + directional + rim)
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
		scene.add(ambientLight)

		const mainLight = new THREE.DirectionalLight(0xffffff, 3.5)
		scene.add(mainLight)

		const rimLight = new THREE.DirectionalLight(0xd0d8e8, 1.5)
		scene.add(rimLight)

		// 2. Weathered Silver PBR Material Setup
		const weatheredTexture = createWeatheredTexture()
		const material = new THREE.MeshPhysicalMaterial({
			color: 0xdcdcdc,
			metalness: 0.95,
			roughness: 0.7,
			roughnessMap: weatheredTexture,
			bumpMap: weatheredTexture,
			bumpScale: 1.5,
			clearcoat: 0.1,
			side: THREE.DoubleSide,
		})

		let currentMesh: THREE.Mesh | null = null

		const renderGeometry = () => {
			if (!data || !Array.isArray(data)) return

			let minX = Infinity,
				maxX = -Infinity
			let minY = Infinity,
				maxY = -Infinity

			for (const item of data) {
				if (!item.points) continue
				for (const pt of Object.values(item.points)) {
					const [x, y] = pt
					if (x < minX) minX = x
					if (x > maxX) maxX = x
					if (y < minY) minY = y
					if (y > maxY) maxY = y
				}
			}

			if (minX === Infinity) return

			const totalWidth = maxX - minX
			const totalHeight = maxY - minY
			renderer.setSize(
				Math.max(10, Math.ceil(totalWidth)),
				Math.max(10, Math.ceil(totalHeight)),
				false
			)

			// 3. Construct Geometry Buffer with inverted Y coordinates
			const positionList: number[] = []
			const uvList: number[] = []
			const indexList: number[] = []
			let vertexOffset = 0

			for (const item of data) {
				if (!item.points || !item.faces) continue

				const ridgeKeys = new Set<string>()
				if (item.ridges) {
					for (const group of item.ridges) {
						for (const key of group) {
							ridgeKeys.add(String(key))
						}
					}
				}

				for (const face of item.faces) {
					if (face.length < 3) continue

					const faceStartIndex = vertexOffset

					for (const keyStr of face) {
						const key = String(keyStr)
						const pt = item.points[key]
						if (!pt) continue

						const [x, y] = pt
						const z = ridgeKeys.has(key) ? depth : 0

						// Invert Y to flip right-side up relative to WebGL space
						const invertedY = maxY - (y - minY)

						positionList.push(x, invertedY, z)
						uvList.push(
							(x - minX) / (totalWidth || 1),
							(invertedY - minY) / (totalHeight || 1)
						)

						vertexOffset++
					}

					// Collect 2D flat coordinates for this face to triangulate correctly with Earcut
					const flatCoords: number[] = []
					for (const keyStr of face) {
						const key = String(keyStr)
						const pt = item.points[key]
						if (pt) {
							flatCoords.push(pt[0], pt[1])
						}
					}
					// Convert face points into an array of THREE.Vector2 instances
					const contourPoints = face.map((keyStr) => {
						const pt = item.points[String(keyStr)]
						const invertedY = maxY - (pt[1] - minY)
						return new THREE.Vector2(pt[0], invertedY)
					})

					// Triangulate using Three.js ShapeUtils
					// Use triangulateShape instead of triangulate
					const triangles = THREE.ShapeUtils.triangulateShape(
						contourPoints,
						[]
					)
					for (const tri of triangles) {
						indexList.push(
							faceStartIndex + tri[0],
							faceStartIndex + tri[1],
							faceStartIndex + tri[2]
						)
					}
				}
			}

			if (positionList.length === 0) return

			if (currentMesh) {
				scene.remove(currentMesh)
				currentMesh.geometry.dispose()
			}

			const geometry = new THREE.BufferGeometry()
			geometry.setAttribute(
				'position',
				new THREE.Float32BufferAttribute(positionList, 3)
			)
			geometry.setAttribute(
				'uv',
				new THREE.Float32BufferAttribute(uvList, 2)
			)
			geometry.setIndex(indexList)
			geometry.computeVertexNormals()

			currentMesh = new THREE.Mesh(geometry, material)
			scene.add(currentMesh)

			// 4. Automatically compute bounding box and frame the entire phrase
			geometry.computeBoundingBox()
			const box = geometry.boundingBox!
			const center = new THREE.Vector3()
			box.getCenter(center)
			const size = new THREE.Vector3()
			box.getSize(size)

			const padding = 20
			const halfW = size.x / 2 + padding
			const halfH = size.y / 2 + padding

			camera.left = -halfW
			camera.right = halfW
			camera.top = halfH
			camera.bottom = -halfH
			camera.near = -1000
			camera.far = 10000
			camera.updateProjectionMatrix()

			camera.position.set(center.x, center.y, 1000)
			camera.lookAt(center.x, center.y, 0)

			const maxDim = Math.max(size.x, size.y, depth)
			mainLight.position.set(center.x + maxDim, center.y + maxDim, maxDim)
			rimLight.position.set(center.x - maxDim, center.y - maxDim, -depth)

			renderer.render(scene, camera)
		}

		renderGeometry()
	}, [data, depth])

	return (
		<div
			ref={containerRef}
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			<canvas
				ref={canvasRef}
				style={{
					display: 'block',
					maxWidth: '100%',
					maxHeight: '100%',
					width: 'auto',
					height: 'auto',
					objectFit: 'contain',
				}}
			/>
		</div>
	)
}
