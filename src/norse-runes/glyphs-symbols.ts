import {o} from './glyphs-lowercase'
import {dot} from './stroke-components'
import {mirrorPtsV, pts2MinY, returnWrapper, translatePtsY} from './util'

export const colon = (sw: number) => {
	const dotGeometry = dot(sw)

	// @todo replace this with one of the line (ascenderLine, baseLine) functions instead of relying on a reconstruction of "o"
	const minY = pts2MinY(Object.values(o(sw).points))
	const midY = (2048 - minY) / 2 + minY

	// amount to move dot down to be in line with lower case letters
	const adjValue = minY - pts2MinY(Object.values(dotGeometry.points))

	/** @note returns a camelCasedStringWithAPrefix */
	const appendPrefix = (prefix: string, key: string) =>
		`${prefix}${key[0].toLocaleUpperCase() + key.slice(1)}`

	const lowerDotPts = Object.fromEntries(
		Object.entries(dotGeometry.points).map(([key, pt]) => [
			appendPrefix('lower', key),
			translatePtsY(adjValue, [pt])[0],
		])
	)

	const upperDotPts = Object.fromEntries(
		Object.entries(lowerDotPts).map(([key, pt]) => {
			const newKey = key.replace(/^lower/, 'upper')

			return [newKey, mirrorPtsV(midY, [pt])[0]]
		})
	)

	return returnWrapper(
		[],
		// points
		{...lowerDotPts, ...upperDotPts},
		// ridges
		[
			...dotGeometry.ridges.map((ridge) =>
				ridge.map((key) => appendPrefix('lower', key))
			),
			...dotGeometry.ridges.map((ridge) =>
				ridge.map((key) => appendPrefix('upper', key))
			),
		],
		// outlines
		[
			...dotGeometry.outlines.map((ridge) =>
				ridge.map((key) => appendPrefix('lower', key))
			),
			...dotGeometry.outlines.map((ridge) =>
				ridge.map((key) => appendPrefix('upper', key))
			),
		],
		// faces
		[
			...dotGeometry.faces.map((ridge) =>
				ridge.map((key) => appendPrefix('lower', key))
			),
			...dotGeometry.faces.map((ridge) =>
				ridge.map((key) => appendPrefix('upper', key))
			),
		]
	)
}
