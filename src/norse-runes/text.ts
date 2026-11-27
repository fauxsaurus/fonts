import {calcLetterSpacings, GLYPHS} from './glyphs'
import {
	objectMap,
	pt,
	pts2MaxX,
	translatePtsX,
	translatePtsY,
	type IPts,
} from './glyphs/util'
import {type IFontProps} from '../font/'

export type ISizedText<K extends string> = {
	letter: string
	size: number
	strokeWidth: number
	points: Record<K, [number, number]>
	ridges: K[][]
	outlines: K[][]
	faces: K[][]
	left: number
}

const scalePts = (scaleFactor: number, pts: IPts) =>
	pts.map(([x, y]) => pt(x * scaleFactor, y * scaleFactor))

/** @note converts a string of text with different font sizes and boldness thicknesses into an array of precisely measured glyphs sized for those specifications. */
export const textProps2sizedGlyphs = (
	normalizedChildren: IFontProps[],
	props: {strokeWidth: number}
) => {
	const {strokeWidth} = props

	const defaultKerning = 192 * 2.5
	const scaledGlyphs = normalizedChildren
		// letter by letter
		.flatMap(({children, size}) =>
			children.split('').map((letter) => ({letter, size}))
		)
		/** @todo ligature support could go here by switching out strings of supported ligatures */
		// scale glyphs
		.map(({letter, size: fontSize}, i, letters) => {
			const sw = strokeWidth

			/** @note the ratio to adjust pts by to achieve the specified pixel height. */
			const scaleFactor = fontSize! / 2048

			const strokeFn = GLYPHS?.[letter as keyof typeof GLYPHS]

			// unsupported glyph (or letter === ' ')
			const {
				points = {},
				ridges = [],
				outlines = [],
				faces = [],
			} = strokeFn?.(sw) ?? {}

			const ptsValue = !strokeFn
				? {
						bottomRight: pt(
							defaultKerning * scaleFactor,
							fontSize!
						),
					}
				: objectMap(points, (pt) => scalePts(scaleFactor, [pt])[0])

			// @note custom temp i+a ligature tweak
			if (letter === 'i' && letters[i + 1].letter === 'a') {
				const ogInset = ptsValue['tailTipInset']

				const h =
					(ptsValue['tailTip'][0] - ptsValue['tailTipInset'][0]) *
					1.25
				const v =
					(ptsValue['tailTip'][1] - ptsValue['tailTipInset'][1]) *
					1.25

				ptsValue['tailTipLeft'][0] -= h
				ptsValue['tailTipLeft'][1] -= v

				ptsValue['tailTip'][0] -= h
				ptsValue['tailTip'][1] -= v

				ptsValue['tailTipRight'][0] -= h
				ptsValue['tailTipRight'][1] -= v

				ptsValue['tailTipInset'][0] -= h
				ptsValue['tailTipInset'][1] -= v
			}

			return {
				letter,
				size: fontSize!,

				strokeWidth,

				points: ptsValue,
				ridges,
				outlines,
				faces,
			}
		})
		// calculate kerning (for future horizontal translation)
		.map((letter, i, letters) => {
			const prevLetter = letters[i - 1]
			if (!prevLetter || prevLetter.letter === ' ')
				return Object.assign({}, letter, {left: 0})

			const potentialLigature = prevLetter.letter + letter.letter

			const smallestLetter =
				prevLetter.size < letter.size ? prevLetter : letter

			const scaleFactor = smallestLetter.size / 2048

			const kerning =
				scaleFactor *
				calcLetterSpacings(
					smallestLetter.strokeWidth,
					potentialLigature
				)

			return Object.assign({}, letter, {
				points: objectMap(
					letter.points,
					(pt) => translatePtsX(kerning, [pt])[0]
				),
			})
		})

	return (
		scaledGlyphs
			// translate all pts horizontally
			.reduce(
				(translatedLetters, letter) => {
					const prevTranslatedLetter = translatedLetters.slice(-1)[0]
					if (!prevTranslatedLetter) return [letter]

					const prevPts = Object.values(prevTranslatedLetter.points)
					const prevWidth = pts2MaxX(Object.values(prevPts))

					const translatedPts = objectMap(
						letter.points,
						(pt) => translatePtsX(prevWidth, [pt])[0]
					)

					return translatedLetters.concat([
						Object.assign({}, letter, {points: translatedPts}),
					])
				},
				[] as typeof scaledGlyphs
			)
			// translate all pts vertically (i.e., align them with the largest baseline)
			.map((letter, _, letters) => {
				const maxSize = Math.max(
					...letters.map((letter) => letter.size)
				)
				if (letter.size === maxSize) return letter

				const v = maxSize - letter.size

				return Object.assign({}, letter, {
					points: objectMap(
						letter.points,
						(pt) => translatePtsY(v, [pt])[0]
					),
				})
			})
	)
}
