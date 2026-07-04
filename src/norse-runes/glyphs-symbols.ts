import {o} from './glyphs-lowercase'
import {dotOld} from './stroke-components'
import {mirrorPtsV, pts2MinY, returnWrapper, translatePtsY} from './util'

export const colon = (sw: number) => {
	const {outline, faces} = dotOld(sw) // positioned at the height it appears in i

	const minY = pts2MinY(o(sw).tmp.flat())
	const midY = (2048 - minY) / 2 + minY

	// amount to move dot down to be in line with lower case letters
	const adjValue = minY - pts2MinY(faces.flat())

	const loweredDotFaces = faces.map((face) => translatePtsY(adjValue, face))

	return returnWrapper([
		translatePtsY(adjValue, outline),
		mirrorPtsV(midY, translatePtsY(adjValue, outline)),

		...loweredDotFaces,
		...loweredDotFaces.map((face) => mirrorPtsV(midY, face)),
	])
}
