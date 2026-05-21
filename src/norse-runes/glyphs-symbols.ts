import {o} from './glyphs-lowercase'
import {dot} from './stroke-components'
import {mirrorPtsV, pts2MinY, translatePtsY, type IPts} from './util'

export const colon = (sw: number): IPts[] => {
	const {outline, faces} = dot(sw) // positioned at the height it appears in i

	const minY = pts2MinY(o(sw).flat())
	const midY = (2048 - minY) / 2 + minY

	// amount to move dot down to be in line with lower case letters
	const adjValue = minY - pts2MinY(faces.flat())

	const loweredDotFaces = faces.map((face) => translatePtsY(adjValue, face))

	return [
		translatePtsY(adjValue, outline),
		mirrorPtsV(midY, translatePtsY(adjValue, outline)),

		...loweredDotFaces,
		...loweredDotFaces.map((face) => mirrorPtsV(midY, face)),
	]
}
