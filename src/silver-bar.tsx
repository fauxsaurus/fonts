import * as THREE from 'three'
import {useCallback, useEffect, useRef} from 'react'

/* ─────────────────────────────────────────────
   Types matching your input format
   ───────────────────────────────────────────── */
interface GlyphInput {
	letter: string
	size: number
	strokeWidth: number
	points: Record<string, [number, number]>
	ridges: string[][]
	outlines: string[][]
	faces: string[][]
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
function createExtrudedGlyphGeometry(
	glyph: GlyphInput,
	depth: number,
	chamfer: number = 0.04
): ChamferedBoxOutput {
	const {points, faces, outlines, ridges} = glyph

	// ── helpers ──────────────────────────────────
	const getXY = (name: string): [number, number] => {
		const p = points[name]
		if (!p) throw new Error(`Unknown point "${name}"`)
		return p
	}

	// Build all quads as vertex + normal arrays, then pack
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
		// two triangles sharing edge b-d
		pushTri(ax, ay, az, bx, by, bz, cx, cy, cz, nx, ny, nz)
		pushTri(ax, ay, az, cx, cy, cz, dx, dy, dz, nx, ny, nz)
	}

	// ── 1. Top & bottom caps (z = depth and z = 0) ──
	for (const face of faces) {
		if (face.length < 3) continue

		// Fan-triangulate convex-ish polygons (your data already has small polys)
		const triCount = face.length - 2
		for (let i = 0; i < triCount; i++) {
			const [ax, ay] = getXY(face[0])
			const [bx, by] = getXY(face[i + 1])
			const [cx, cy] = getXY(face[i + 2])

			// Top cap (z = depth), normal +Z
			pushTri(ax, ay, depth, bx, by, depth, cx, cy, depth, 0, 0, 1)

			// Bottom cap (z = 0), normal -Z (reverse winding)
			pushTri(cx, cy, 0, bx, by, 0, ax, ay, 0, 0, 0, -1)
		}
	}

	// ── 2. Wall segments from outlines (full height) ──
	for (const outline of outlines) {
		const n = outline.length
		for (let i = 0; i < n; i++) {
			const j = (i + 1) % n
			const [x0, y0] = getXY(outline[i])
			const [x1, y1] = getXY(outline[j])

			// Outward-facing normal in XY plane (perpendicular to edge, pointing right of traversal)
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

	// ── 3. Ridge walls (partial-height vertical strips along ridge edges) ──
	// Each ridge polyline creates a thin wall rising from z=0 to z=depth
	// between adjacent ridge points. These are internal creases; we emit
	// them as double-sided quads so both sides catch light.
	for (const ridge of ridges) {
		const n = ridge.length
		for (let i = 0; i < n; i++) {
			const j = (i + 1) % n
			const [x0, y0] = getXY(ridge[i])
			const [x1, y1] = getXY(ridge[j])

			const ex = x1 - x0
			const ey = y1 - y0
			const len = Math.hypot(ex, ey) || 1
			const nx = ey / len
			const ny = -ex / len

			// Front side
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
			// Back side (opposite normal)
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

	// ── 4. Optional: bevel/chamfer the top & bottom rim edges ──
	// For each outline edge, insert a chamfer band at top and bottom.
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
				// outward normal
				const nx = uy
				const ny = -ux

				// Inset direction toward polygon interior (negative normal)
				const ix = -nx * chamfer
				const iy = -ny * chamfer

				// Bottom chamfer: from (x,y,0) → (x+ix, y+iy, chamfer)
				const chNx = nx * 0.7071
				const chNy = ny * 0.7071
				const chNz = -0.7071
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
					chNx,
					chNy,
					chNz
				)

				// Top chamfer: from (x+ix, y+iy, depth-chamfer) → (x,y,depth)
				const tcNx = nx * 0.7071
				const tcNy = ny * 0.7071
				const tcNz = 0.7071
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
					tcNx,
					tcNy,
					tcNz
				)
			}
		}
	}

	// ── 5. Pack into typed arrays ─────────────────
	return {
		positions: new Float32Array(verts),
		normals: new Float32Array(norms),
		indices: new Uint32Array(idxs),
	}
}

/* ─────────────────────────────────────────────
   Rounded / chamfered box geometry
   ───────────────────────────────────────────── */
function createChamferedBoxGeometry(
	w: number,
	h: number,
	d: number,
	chamfer: number
): {
	positions: Float32Array
	normals: Float32Array
	indices: Uint32Array
} {
	const faces: Array<{
		verts: [number, number, number][]
		norm: [number, number, number]
	}> = []

	const hw = w / 2 - chamfer
	const hh = h / 2 - chamfer
	const hd = d / 2 - chamfer

	// 6 main faces
	faces.push({
		verts: [
			[-hw, -hh, hd],
			[hw, -hh, hd],
			[hw, hh, hd],
			[-hw, hh, hd],
		],
		norm: [0, 0, 1],
	})
	faces.push({
		verts: [
			[hw, -hh, -hd],
			[-hw, -hh, -hd],
			[-hw, hh, -hd],
			[hw, hh, -hd],
		],
		norm: [0, 0, -1],
	})
	faces.push({
		verts: [
			[hw, -hh, hd],
			[hw, -hh, -hd],
			[hw, hh, -hd],
			[hw, hh, hd],
		],
		norm: [1, 0, 0],
	})
	faces.push({
		verts: [
			[-hw, -hh, -hd],
			[-hw, -hh, hd],
			[-hw, hh, hd],
			[-hw, hh, -hd],
		],
		norm: [-1, 0, 0],
	})
	faces.push({
		verts: [
			[-hw, hh, -hd],
			[hw, hh, -hd],
			[hw, hh, hd],
			[-hw, hh, hd],
		],
		norm: [0, 1, 0],
	})
	faces.push({
		verts: [
			[-hw, -hh, hd],
			[hw, -hh, hd],
			[hw, -hh, -hd],
			[-hw, -hh, -hd],
		],
		norm: [0, -1, 0],
	})

	// 12 chamfer edges
	const el = chamfer * 0.9
	// top-front, top-back, bottom-front, bottom-back
	faces.push({
		verts: [
			[-hw, hh, hd],
			[-hw, hh, hd + el],
			[hw, hh, hd + el],
			[hw, hh, hd],
		],
		norm: [0, 1, 1],
	})
	faces.push({
		verts: [
			[hw, hh, -hd],
			[hw, hh, -hd - el],
			[-hw, hh, -hd - el],
			[-hw, hh, -hd],
		],
		norm: [0, 1, -1],
	})
	faces.push({
		verts: [
			[-hw, -hh, hd],
			[-hw, -hh, hd + el],
			[hw, -hh, hd + el],
			[hw, -hh, hd],
		],
		norm: [0, -1, 1],
	})
	faces.push({
		verts: [
			[hw, -hh, -hd],
			[hw, -hh, -hd - el],
			[-hw, -hh, -hd - el],
			[-hw, -hh, -hd],
		],
		norm: [0, -1, -1],
	})
	// right-front, right-back
	faces.push({
		verts: [
			[hw, -hh, hd],
			[hw + el, -hh, hd],
			[hw + el, hh, hd],
			[hw, hh, hd],
		],
		norm: [1, 0, 1],
	})
	faces.push({
		verts: [
			[hw, -hh, -hd],
			[hw + el, -hh, -hd],
			[hw + el, hh, -hd],
			[hw, hh, -hd],
		],
		norm: [1, 0, -1],
	})
	// left-front, left-back
	faces.push({
		verts: [
			[-hw, -hh, hd],
			[-hw, -hh, hd + el],
			[-hw, hh, hd + el],
			[-hw, hh, hd],
		],
		norm: [-1, 0, 1],
	})
	faces.push({
		verts: [
			[-hw, -hh, -hd],
			[-hw, -hh, -hd - el],
			[-hw, hh, -hd - el],
			[-hw, hh, -hd],
		],
		norm: [-1, 0, -1],
	})
	// top-right, top-left
	faces.push({
		verts: [
			[hw, hh, -hd],
			[hw, hh, -hd - el],
			[hw, hh, -hd + el],
			[hw, hh, hd],
		],
		norm: [1, 1, 0],
	})
	faces.push({
		verts: [
			[-hw, hh, -hd],
			[-hw, hh, -hd - el],
			[-hw, hh, -hd + el],
			[-hw, hh, hd],
		],
		norm: [-1, 1, 0],
	})
	// bottom-right, bottom-left
	faces.push({
		verts: [
			[hw, -hh, -hd],
			[hw, -hh, -hd - el],
			[hw, -hh, -hd + el],
			[hw, -hh, hd],
		],
		norm: [1, -1, 0],
	})
	faces.push({
		verts: [
			[-hw, -hh, -hd],
			[-hw, -hh, -hd - el],
			[-hw, -hh, -hd + el],
			[-hw, -hh, hd],
		],
		norm: [-1, -1, 0],
	})

	// Compute vertex counts
	const totalVerts = faces.reduce((sum, f) => sum + f.verts.length, 0)
	const totalIdx = faces.length * 6 // 2 triangles per quad

	const positions = new Float32Array(totalVerts * 3)
	const normals = new Float32Array(totalVerts * 3)
	const indices = new Uint32Array(totalIdx)

	let vOffset = 0
	let iOffset = 0

	for (const face of faces) {
		const v0 = face.verts[0]
		const v1 = face.verts[1]
		const v2 = face.verts[2]
		const v3 = face.verts[3]
		const nx = face.norm[0]
		const ny = face.norm[1]
		const nz = face.norm[2]

		// Quad 1: v0, v1, v2
		positions[vOffset * 3] = v0[0]
		positions[vOffset * 3 + 1] = v0[1]
		positions[vOffset * 3 + 2] = v0[2]
		normals[vOffset * 3] = nx
		normals[vOffset * 3 + 1] = ny
		normals[vOffset * 3 + 2] = nz
		vOffset++
		positions[vOffset * 3] = v1[0]
		positions[vOffset * 3 + 1] = v1[1]
		positions[vOffset * 3 + 2] = v1[2]
		normals[vOffset * 3] = nx
		normals[vOffset * 3 + 1] = ny
		normals[vOffset * 3 + 2] = nz
		vOffset++
		positions[vOffset * 3] = v2[0]
		positions[vOffset * 3 + 1] = v2[1]
		positions[vOffset * 3 + 2] = v2[2]
		normals[vOffset * 3] = nx
		normals[vOffset * 3 + 1] = ny
		normals[vOffset * 3 + 2] = nz
		vOffset++
		indices[iOffset] = vOffset - 3
		indices[iOffset + 1] = vOffset - 2
		indices[iOffset + 2] = vOffset - 1
		iOffset += 3

		// Quad 2: v0, v2, v3
		positions[vOffset * 3] = v0[0]
		positions[vOffset * 3 + 1] = v0[1]
		positions[vOffset * 3 + 2] = v0[2]
		normals[vOffset * 3] = nx
		normals[vOffset * 3 + 1] = ny
		normals[vOffset * 3 + 2] = nz
		vOffset++
		positions[vOffset * 3] = v2[0]
		positions[vOffset * 3 + 1] = v2[1]
		positions[vOffset * 3 + 2] = v2[2]
		normals[vOffset * 3] = nx
		normals[vOffset * 3 + 1] = ny
		normals[vOffset * 3 + 2] = nz
		vOffset++
		positions[vOffset * 3] = v3[0]
		positions[vOffset * 3 + 1] = v3[1]
		positions[vOffset * 3 + 2] = v3[2]
		normals[vOffset * 3] = nx
		normals[vOffset * 3 + 1] = ny
		normals[vOffset * 3 + 2] = nz
		vOffset++
		indices[iOffset] = vOffset - 3
		indices[iOffset + 1] = vOffset - 2
		indices[iOffset + 2] = vOffset - 1
		iOffset += 3
	}

	return {positions, normals, indices}
}

/* ─────────────────────────────────────────────
   Procedural environment map (studio-like)
   ───────────────────────────────────────────── */
function createEnvTexture(renderer: THREE.WebGLRenderer): THREE.DataTexture {
	const size = 512
	const data = new Uint8Array(size * size * 4)

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4

			// Normalize to spherical coords
			const u = x / size
			const v = y / size
			const theta = u * Math.PI * 2
			const phi = v * Math.PI

			const sx = Math.sin(phi) * Math.cos(theta)
			const sy = Math.cos(phi)
			const sz = Math.sin(phi) * Math.sin(theta)

			// Dark studio background
			let r = 12,
				g = 12,
				b = 16

			// Bright ceiling strip (around phi = 0.3–0.5)
			const stripCenter = 0.4
			const stripWidth = 0.12
			const stripDist = Math.abs(sy - Math.cos(stripCenter))
			if (stripDist < stripWidth) {
				const strength = 1 - stripDist / stripWidth
				const t = strength * strength * strength
				r += t * 220
				g += t * 220
				b += t * 210
			}

			// Softbox panels on sides
			for (let p = 0; p < 4; p++) {
				const angle = (p / 4) * Math.PI * 2 + Math.PI / 8
				const px = Math.cos(angle)
				const pz = Math.sin(angle)
				const sideDist = Math.abs(sx * px + sz * pz)
				if (sideDist < 0.35 && sy > -0.2 && sy < 0.8) {
					const sideStrength = 1 - sideDist / 0.35
					const syFactor = Math.max(0, 1 - Math.abs(sy - 0.3) / 0.6)
					const panel = sideStrength * syFactor * 0.2
					r += panel * 200
					g += panel * 200
					b += panel * 190
				}
			}

			// Subtle hemisphere gradient
			const hemi = Math.max(0, sy) * 0.3
			r += hemi * 30
			g += hemi * 30
			b += hemi * 35

			data[i] = Math.min(255, r)
			data[i + 1] = Math.min(255, g)
			data[i + 2] = Math.min(255, b)
			data[i + 3] = 255
		}
	}

	const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
	texture.mapping = THREE.EquirectangularReflectionMapping
	texture.needsUpdate = true
	return texture
}

/* ─────────────────────────────────────────────
   Mouse-based orbit (no dependencies)
   ───────────────────────────────────────────── */
interface OrbitState {
	theta: number // horizontal angle
	phi: number // vertical angle
	radius: number
	dragging: boolean
	lastX: number
	lastY: number
	targetTheta: number
	targetPhi: number
	targetRadius: number
}

function useOrbit(
	canvasRef: React.RefObject<HTMLCanvasElement | null>
): OrbitState {
	const state = useRef<OrbitState>({
		theta: Math.PI * 0.15,
		phi: Math.PI * 0.32,
		radius: 7,
		dragging: false,
		lastX: 0,
		lastY: 0,
		targetTheta: Math.PI * 0.15,
		targetPhi: Math.PI * 0.32,
		targetRadius: 7,
	}).current

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const onPointerDown = (e: PointerEvent) => {
			state.dragging = true
			state.lastX = e.clientX
			state.lastY = e.clientY
			canvas.setPointerCapture(e.pointerId)
		}
		const onPointerMove = (e: PointerEvent) => {
			if (!state.dragging) return
			const dx = e.clientX - state.lastX
			const dy = e.clientY - state.lastY
			state.targetTheta -= dx * 0.005
			state.targetPhi = Math.max(
				0.15,
				Math.min(Math.PI - 0.15, state.targetPhi - dy * 0.005)
			)
			state.lastX = e.clientX
			state.lastY = e.clientY
		}
		const onPointerUp = () => {
			state.dragging = false
		}
		const onWheel = (e: WheelEvent) => {
			e.preventDefault()
			state.targetRadius = Math.max(
				3,
				Math.min(18, state.targetRadius + e.deltaY * 0.008)
			)
		}

		canvas.addEventListener('pointerdown', onPointerDown)
		canvas.addEventListener('pointermove', onPointerMove)
		canvas.addEventListener('pointerup', onPointerUp)
		canvas.addEventListener('wheel', onWheel, {passive: false})

		return () => {
			canvas.removeEventListener('pointerdown', onPointerDown)
			canvas.removeEventListener('pointermove', onPointerMove)
			canvas.removeEventListener('pointerup', onPointerUp)
			canvas.removeEventListener('wheel', onWheel)
		}
	}, [canvasRef, state])

	return state
}

/* ─────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────── */
export default function SilverBarViewer() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const orbit = useOrbit(canvasRef)
	const sceneRef = useRef<{
		scene: THREE.Scene
		camera: THREE.PerspectiveCamera
		renderer: THREE.WebGLRenderer
		bar: THREE.Mesh
		envMap: THREE.DataTexture
		animId: number
	} | null>(null)

	const initScene = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		// Renderer
		const renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: false,
		})
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		renderer.setSize(canvas.clientWidth, canvas.clientHeight)
		renderer.toneMapping = THREE.ACESFilmicToneMapping
		renderer.toneMappingExposure = 1.1
		renderer.outputColorSpace = THREE.SRGBColorSpace
		renderer.shadowMap.enabled = true
		renderer.shadowMap.type = THREE.PCFSoftShadowMap

		// Scene
		const scene = new THREE.Scene()
		scene.background = new THREE.Color('#0e0e14')
		scene.fog = new THREE.Fog('#0e0e14', 14, 25)

		// Camera
		const camera = new THREE.PerspectiveCamera(
			38,
			canvas.clientWidth / canvas.clientHeight,
			0.1,
			50
		)

		// Environment map
		const envMap = createEnvTexture(renderer)

		// Bar geometry
		const {positions, normals, indices} = createChamferedBoxGeometry(
			3.6,
			0.55,
			0.85,
			0.07
		)
		const geometry = new THREE.BufferGeometry()
		geometry.setAttribute(
			'position',
			new THREE.BufferAttribute(positions, 3)
		)
		geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
		geometry.setIndex(new THREE.BufferAttribute(indices, 1))
		geometry.computeVertexNormals()

		// Silver material
		const material = new THREE.MeshPhysicalMaterial({
			color: '#c8c8d0',
			metalness: 0.97,
			roughness: 0.06,
			envMap,
			envMapIntensity: 1.8,
			clearcoat: 0.15,
			clearcoatRoughness: 0.08,
		})

		const bar = new THREE.Mesh(geometry, material)
		bar.castShadow = true
		bar.receiveShadow = true
		bar.position.y = 0
		scene.add(bar)

		// Lights
		const ambient = new THREE.AmbientLight(0xffffff, 0.25)
		scene.add(ambient)

		const keyLight = new THREE.DirectionalLight(0xffffff, 1.8)
		keyLight.position.set(5, 8, 4)
		keyLight.castShadow = true
		keyLight.shadow.mapSize.set(1024, 1024)
		keyLight.shadow.camera.near = 1
		keyLight.shadow.camera.far = 20
		keyLight.shadow.camera.left = -5
		keyLight.shadow.camera.right = 5
		keyLight.shadow.camera.top = 5
		keyLight.shadow.camera.bottom = -5
		keyLight.shadow.bias = -0.001
		scene.add(keyLight)

		const fillLight = new THREE.DirectionalLight(0xaabbff, 0.6)
		fillLight.position.set(-4, 3, -2)
		scene.add(fillLight)

		const rimLight = new THREE.PointLight(0xffffff, 0.5, 15)
		rimLight.position.set(0, 6, 0)
		scene.add(rimLight)

		// Shadow floor
		const floorGeo = new THREE.PlaneGeometry(30, 30)
		const floorMat = new THREE.ShadowMaterial({opacity: 0.35})
		const floor = new THREE.Mesh(floorGeo, floorMat)
		floor.rotation.x = -Math.PI / 2
		floor.position.y = -0.35
		floor.receiveShadow = true
		scene.add(floor)

		sceneRef.current = {scene, camera, renderer, bar, envMap, animId: 0}
	}, [])

	// Resize handler
	useEffect(() => {
		const onResize = () => {
			const canvas = canvasRef.current
			const s = sceneRef.current
			if (!canvas || !s) return
			const w = canvas.clientWidth
			const h = canvas.clientHeight
			s.camera.aspect = w / h
			s.camera.updateProjectionMatrix()
			s.renderer.setSize(w, h)
		}

		initScene()
		window.addEventListener('resize', onResize)
		return () => window.removeEventListener('resize', onResize)
	}, [initScene])

	// Animation loop
	useEffect(() => {
		const s = sceneRef.current
		if (!s) return

		const animate = () => {
			// Smooth orbit interpolation
			orbit.theta += (orbit.targetTheta - orbit.theta) * 0.08
			orbit.phi += (orbit.targetPhi - orbit.phi) * 0.08
			orbit.radius += (orbit.targetRadius - orbit.radius) * 0.08

			const camX =
				orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta)
			const camY = orbit.radius * Math.cos(orbit.phi)
			const camZ =
				orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta)

			s.camera.position.set(camX, camY, camZ)
			s.camera.lookAt(0, 0, 0)
			s.renderer.render(s.scene, s.camera)
			s.animId = requestAnimationFrame(animate)
		}

		s.animId = requestAnimationFrame(animate)
		return () => cancelAnimationFrame(s.animId)
	}, [orbit])

	// Cleanup
	useEffect(() => {
		return () => {
			const s = sceneRef.current
			if (!s) return
			cancelAnimationFrame(s.animId)
			s.renderer.dispose()
			s.envMap.dispose()
		}
	}, [])

	return (
		<canvas
			ref={canvasRef}
			style={{
				width: '100%',
				height: '100%',
				display: 'block',
				cursor: orbit.dragging ? 'grabbing' : 'grab',
			}}
		/>
	)
}
