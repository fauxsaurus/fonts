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
		renderer.setClearColor(0x000000, 0) // 0 alpha means 100% transparent
		renderer.toneMapping = THREE.ACESFilmicToneMapping

		const scene = new THREE.Scene()

		const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000)

		// 1. Lighting Setup
		// Global ambient lighting at 50% intensity (0.5)
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
		scene.add(ambientLight)

		// Directional key light coming from upper-right hand side
		const mainLight = new THREE.DirectionalLight(0xaaccff, 4.0)
		scene.add(mainLight)

		// Secondary rim light for contrast in dark areas
		const rimLight = new THREE.DirectionalLight(0x224488, 2.0)
		scene.add(rimLight)

		// 2. Weathered Silver PBR Material Setup
		const weatheredTexture = createWeatheredTexture()
		const material = new THREE.MeshPhysicalMaterial({
			color: 0x162126,
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

			// 3. Automatically adjust canvas resolution to match largest X and Y coordinates
			let maxX = 0
			let maxY = 0

			for (const item of data) {
				if (!item.points) continue
				for (const pt of Object.values(item.points)) {
					const [x, y] = pt
					if (x > maxX) maxX = x
					if (y > maxY) maxY = y
				}
			}

			const canvasWidth = Math.max(10, Math.ceil(maxX))
			const canvasHeight = Math.max(10, Math.ceil(maxY))

			renderer.setSize(canvasWidth, canvasHeight, false)
			camera.aspect = canvasWidth / canvasHeight

			// 4. Construct Geometry Buffer from Flat Faces & Ridges using standard for...of loops
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
					if (face.length < 3) continue // Now works properly with standard loops

					const faceStartIndex = vertexOffset

					for (const keyStr of face) {
						const key = String(keyStr)
						const pt = item.points[key]
						if (!pt) continue

						const [x, y] = pt
						const z = ridgeKeys.has(key) ? depth : 0

						// invert Y to match teh WebGL coordinate space
						positionList.push(x, canvasHeight - y, z)
						uvList.push(
							x / canvasWidth,
							(canvasHeight - y) / canvasHeight
						)

						vertexOffset++
					}

					// Triangulate flat n-gon faces using triangle fan
					const vertCount = face.length
					for (let i = 1; i < vertCount - 1; i++) {
						indexList.push(
							faceStartIndex,
							faceStartIndex + i,
							faceStartIndex + i + 1
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

			// 5. Auto-fit Camera and Light positions to bounding box
			geometry.computeBoundingBox()
			const box = geometry.boundingBox!
			const center = new THREE.Vector3()
			box.getCenter(center)
			const size = new THREE.Vector3()
			box.getSize(size)

			const fovV = (camera.fov * Math.PI) / 180
			const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect)

			const distY = size.y / 2 / Math.tan(fovV / 2)
			const distX = size.x / 2 / Math.tan(fovH / 2)
			const fitDistance =
				Math.max(distX, distY, size.z) * 1.25 + size.z / 2

			camera.position.set(
				center.x,
				center.y,
				center.z + Math.max(fitDistance, 20)
			)
			camera.updateProjectionMatrix()

			const maxDim = Math.max(canvasWidth, canvasHeight, depth)
			mainLight.position.set(
				center.x + maxDim,
				center.y + maxDim,
				center.z + maxDim
			)
			rimLight.position.set(
				center.x - maxDim,
				center.y - maxDim,
				center.z - depth
			)

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
					boxShadow: '0 0 25px rgba(0, 0, 0, 0.9)',
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
