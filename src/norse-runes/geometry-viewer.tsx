import * as THREE from 'three'
import {useCallback, useEffect, useRef} from 'react'

/* ─────────────────────────────────────────────
   Output type (shared with createExtrudedGlyphGeometry)
   ───────────────────────────────────────────── */
interface ChamferedBoxOutput {
	positions: Float32Array
	normals: Float32Array
	indices: Uint32Array
}

/* ─────────────────────────────────────────────
   Mouse-based orbit (unchanged — self-contained)
   ───────────────────────────────────────────── */
interface OrbitState {
	theta: number
	phi: number
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
   Procedural environment map (unchanged — self-contained)
   ───────────────────────────────────────────── */
function createEnvTexture(renderer: THREE.WebGLRenderer): THREE.DataTexture {
	const size = 512
	const data = new Uint8Array(size * size * 4)

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4

			const u = x / size
			const v = y / size
			const theta = u * Math.PI * 2
			const phi = v * Math.PI

			const sx = Math.sin(phi) * Math.cos(theta)
			const sy = Math.cos(phi)
			const sz = Math.sin(phi) * Math.sin(theta)

			let r = 12,
				g = 12,
				b = 16

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
   SilverBarViewer — receives pre-built geometry
   ───────────────────────────────────────────── */
interface SilverBarViewerProps {
	geometry: ChamferedBoxOutput
	/** Optional custom material overrides; defaults to polished silver */
	material?: Partial<THREE.MeshPhysicalMaterial>
	/** Optional label for debugging / aria */
	label?: string
}

/* ─────────────────────────────────────────────
   Framing helper — computes bounding sphere of the
   geometry and returns a camera distance that fits it
   entirely within the current viewport aspect ratio.
   ───────────────────────────────────────────── */
function computeFitDistance(
	geometry: THREE.BufferGeometry,
	fovDeg: number,
	aspect: number,
	padding: number = 1.15
): {center: THREE.Vector3; radius: number; distance: number} {
	geometry.computeBoundingSphere()
	const sphere = geometry.boundingSphere!
	const center = sphere.center.clone()
	const radius = sphere.radius

	const fovRad = (fovDeg * Math.PI) / 180

	// Vertical fit
	const distV = radius / Math.sin(fovRad / 2)

	// Horizontal fit — derive horizontal FOV from vertical FOV + aspect
	const hFovRad = 2 * Math.atan(Math.tan(fovRad / 2) * aspect)
	const distH = radius / Math.sin(hFovRad / 2)

	// Take whichever axis is more constraining, plus padding margin
	const distance = Math.max(distV, distH) * padding

	return {center, radius, distance}
}

/* ─────────────────────────────────────────────
   SilverBarViewer — auto-centers & auto-frames
   whatever ChamferedBoxOutput it receives
   ───────────────────────────────────────────── */
interface SilverBarViewerProps {
	geometry: ChamferedBoxOutput
	material?: Partial<THREE.MeshPhysicalMaterial>
	label?: string
	/** Extra margin around the object as a multiplier (default 1.15) */
	padding?: number
}

export default function GeometryViewer({
	geometry,
	material: materialOverrides = {},
	label = 'silver bar',
	padding = 1.15,
}: SilverBarViewerProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const orbit = useOrbit(canvasRef)
	const sceneRef = useRef<{
		scene: THREE.Scene
		camera: THREE.PerspectiveCamera
		renderer: THREE.WebGLRenderer
		mesh: THREE.Mesh
		envMap: THREE.DataTexture
		animId: number
		/** Bounding-sphere center — camera orbits this instead of world origin */
		lookAtTarget: THREE.Vector3
		/** Distance that frames the whole object at init time */
		fitDistance: number
	} | null>(null)

	const initScene = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas) return

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

		const scene = new THREE.Scene()
		scene.background = new THREE.Color('#0e0e14')

		const FOV = 38
		const camera = new THREE.PerspectiveCamera(
			FOV,
			canvas.clientWidth / canvas.clientHeight,
			0.1,
			200
		)

		const envMap = createEnvTexture(renderer)

		// Build BufferGeometry from incoming data
		const bufGeo = new THREE.BufferGeometry()
		bufGeo.setAttribute(
			'position',
			new THREE.BufferAttribute(geometry.positions, 3)
		)
		bufGeo.setAttribute(
			'normal',
			new THREE.BufferAttribute(geometry.normals, 3)
		)
		bufGeo.setIndex(new THREE.BufferAttribute(geometry.indices, 1))

		const material = new THREE.MeshPhysicalMaterial({
			color: '#c8c8d0',
			metalness: 0.97,
			roughness: 0.06,
			envMap,
			envMapIntensity: 1.8,
			clearcoat: 0.15,
			clearcoatRoughness: 0.08,
			...materialOverrides,
		})

		const mesh = new THREE.Mesh(bufGeo, material)
		mesh.castShadow = true
		mesh.receiveShadow = true
		mesh.name = label
		scene.add(mesh)

		// ── Auto-frame: measure geometry, position camera to fit ──
		const {center, radius, distance} = computeFitDistance(
			bufGeo,
			FOV,
			canvas.clientWidth / canvas.clientHeight,
			padding
		)

		// Offset fog so it doesn't clip the object regardless of scale
		scene.fog = new THREE.Fog('#0e0e14', distance * 2, distance * 4)

		// Scale lights relative to object size so small glyphs aren't blown out
		const lightScale = Math.max(radius, 1)

		const ambient = new THREE.AmbientLight(0xffffff, 0.25)
		scene.add(ambient)

		const keyLight = new THREE.DirectionalLight(0xffffff, 1.8)
		keyLight.position
			.copy(center)
			.add(
				new THREE.Vector3(
					lightScale * 1.4,
					lightScale * 2.2,
					lightScale * 1.1
				)
			)
		keyLight.target.position.copy(center)
		keyLight.castShadow = true
		const shadowExtent = radius * 1.5
		keyLight.shadow.mapSize.set(1024, 1024)
		keyLight.shadow.camera.near = 0.1
		keyLight.shadow.camera.far = lightScale * 10
		keyLight.shadow.camera.left = -shadowExtent
		keyLight.shadow.camera.right = shadowExtent
		keyLight.shadow.camera.top = shadowExtent
		keyLight.shadow.camera.bottom = -shadowExtent
		keyLight.shadow.bias = -0.001
		scene.add(keyLight)
		scene.add(keyLight.target)

		const fillLight = new THREE.DirectionalLight(0xaabbff, 0.6)
		fillLight.position
			.copy(center)
			.add(
				new THREE.Vector3(
					-lightScale * 1.1,
					lightScale * 0.8,
					-lightScale * 0.6
				)
			)
		fillLight.target.position.copy(center)
		scene.add(fillLight)
		scene.add(fillLight.target)

		const rimLight = new THREE.PointLight(0xffffff, 0.5, lightScale * 8)
		rimLight.position
			.copy(center)
			.add(new THREE.Vector3(0, lightScale * 1.6, 0))
		scene.add(rimLight)

		// Shadow floor sits just below the object's lowest point
		const bbox = new THREE.Box3().setFromBufferAttribute(
			bufGeo.getAttribute('position') as THREE.BufferAttribute
		)
		const floorGeo = new THREE.PlaneGeometry(radius * 12, radius * 12)
		const floorMat = new THREE.ShadowMaterial({opacity: 0.35})
		const floor = new THREE.Mesh(floorGeo, floorMat)
		floor.rotation.x = -Math.PI / 2
		floor.position.set(center.x, bbox.min.y - 0.01, center.z)
		floor.receiveShadow = true
		scene.add(floor)

		// Seed orbit state with computed framing values
		orbit.targetRadius = distance
		orbit.radius = distance
		orbit.targetTheta = Math.PI * 0.15
		orbit.theta = Math.PI * 0.15
		orbit.targetPhi = Math.PI * 0.32
		orbit.phi = Math.PI * 0.32

		sceneRef.current = {
			scene,
			camera,
			renderer,
			mesh,
			envMap,
			animId: 0,
			lookAtTarget: center,
			fitDistance: distance,
		}
	}, [geometry, materialOverrides, label, padding, orbit])

	// Re-fit on resize
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

			// Recompute fit distance for new aspect ratio
			const {distance} = computeFitDistance(
				s.mesh.geometry,
				s.camera.fov,
				w / h,
				padding
			)
			s.fitDistance = distance

			// Only reset zoom if user hasn't manually zoomed much (within 20%)
			const ratio = orbit.targetRadius / distance
			if (ratio < 0.8 || ratio > 1.2) {
				orbit.targetRadius = distance
			}
		}

		initScene()
		window.addEventListener('resize', onResize)
		return () => window.removeEventListener('resize', onResize)
	}, [initScene, orbit, padding])

	// Animation loop — orbits around the geometry's bounding-sphere center
	useEffect(() => {
		const s = sceneRef.current
		if (!s) return

		const animate = () => {
			orbit.theta += (orbit.targetTheta - orbit.theta) * 0.08
			orbit.phi += (orbit.targetPhi - orbit.phi) * 0.08
			orbit.radius += (orbit.targetRadius - orbit.radius) * 0.08

			const camX =
				s.lookAtTarget.x +
				orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta)
			const camY = s.lookAtTarget.y + orbit.radius * Math.cos(orbit.phi)
			const camZ =
				s.lookAtTarget.z +
				orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta)

			s.camera.position.set(camX, camY, camZ)
			s.camera.lookAt(s.lookAtTarget)
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
			aria-label={label}
		/>
	)
}
