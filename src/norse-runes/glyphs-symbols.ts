import {i, o} from './glyphs-lowercase'
import {mirrorPtsV, pts2MaxY, pts2MinY, translatePtsY, type IPts} from './util'

export const colon = (sw: number): IPts[] => {
	const minY = pts2MinY(o(sw).flat())
	const midY = (2048 - minY) / 2 + minY

	// get faces above the i's stem
	const dotFaces = i(sw).filter((face) => pts2MaxY(face) < minY)

	// amount to move dot down to be in line with lower case letters
	const adjValue = minY - pts2MinY(dotFaces.flat())

	const loweredDotFaces = dotFaces.map((face) =>
		translatePtsY(adjValue, face)
	)

	return [
		...loweredDotFaces,
		...loweredDotFaces.map((face) => mirrorPtsV(midY, face)),
	]
}
