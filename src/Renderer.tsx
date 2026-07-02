import {useRef, useEffect} from 'react'

export const Renderer = ({width, height}: {height: number; width: number}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)

	useEffect(() => {
		const canvas = canvasRef.current!
		const gl = canvas.getContext('webgl')
		if (!gl) return console.error('WebGL not supported')

		// render (adapted from https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial)

		gl.clearColor(0.0, 0.0, 0.0, 1.0) // Set clear color to black, fully opaque
		gl.clear(gl.COLOR_BUFFER_BIT) // Clear the color buffer with specified clear color

		/** @note
		 * shader program = vertex shader + fragment shader
		 * vertex shader = maps vertexes to the clip space (the space rendered in the scene, always -1 to +1 for x & y axis *regardless* of canvas size)
		 * fragment shader = compute a color for each px of the thing being drawn (per: https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html)
		 *
		 * texel = a single pixel within a texture (texels are to textures as pixels are to images)
		 * varyings = store data to pass from teh vertex shader to the fragment shader
		 * attributes = variables only available to the vertex shader & JS (e.g., color, texture coords)
		 */

		// cleanup
		return () => {}
	}, [])

	return <canvas ref={canvasRef} width={width} height={height} />
}
