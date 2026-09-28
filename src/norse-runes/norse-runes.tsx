import type {ReactNode} from 'react'
import * as glyphs from './glyphs'
import {
	objectMap,
	pt,
	pts2MaxX,
	pts2MaxY,
	translatePtsX,
	translatePtsY,
	type IPt,
	type IPts,
} from './util'
import {Font, type IFontProps} from '../font/'

type IProps = {
	children: string
	/** @note If true, individual glyph strokes will render with different colors to help visualize changes. */
	debug?: boolean
	/** @note height of the <svg> element in rem units */
	fontSize: number
	kerning: number
	/** @note the width of each font segment (a number relative to 2048) */
	strokeWidth: number
	twoTone?: boolean
}

const DEBUG_STYLES = `@scope {
	g[transform] path {
		fill: hsl(
			from plum
			calc(
				60 * (sibling-index() - 1)
			) s l
		);
		opacity: 0.75;
		stroke: black;
		stroke-width: 1;
	}
}
`

const GLYPH_STROKES = {
	...glyphs,

	':': glyphs.colon,
}

const calcLetterSpacings = (sw: number) => {
	const sw2 = sw / 2
	const sw4 = sw / 4

	const perpendicularDiagonals = sw4
	const nestedDiagonals = -sw

	return {
		BC: nestedDiagonals,
		be: perpendicularDiagonals,
		bc: perpendicularDiagonals,
		cd: nestedDiagonals,
		dj: sw * -0.75 /** @todo come up with a more exact figure */,
		Em: sw2,
		fg: -sw,
		he: sw2,
		ho: sw2,
		ia: sw4,
		ij: -sw,
		Ne: sw2,
		no: sw2, // label as corner + vertical?
		of: sw2,
		op: sw2,
		os: sw2,
		pq: perpendicularDiagonals,
		nd: sw2,
		re: -perpendicularDiagonals,
		rs: -sw2,
	}
}

const pts2svg = (pts: IPt[]) => pts.map((pt) => pt.join(',')).join(' ')
const sum = (numbers: number[]) => numbers.reduce((a, b) => a + b, 0)

const scalePts = (scaleFactor: number, pts: IPts) =>
	pts.map(([x, y]) => pt(x * scaleFactor, y * scaleFactor))

const Tmp2dSvgBasedShading = () => {
	return (
		<defs>
			<linearGradient
				id="css-grad-1"
				x1="0%"
				y1="0%"
				x2="0%"
				y2="4.5%"
				spreadMethod="repeat"
			>
				<stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
				<stop offset="66.67%" stopColor="#ffffff" stopOpacity="0" />
				<stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
			</linearGradient>

			<linearGradient
				id="css-grad-2"
				x1="0%"
				y1="0%"
				x2="0%"
				y2="2.5%"
				spreadMethod="repeat"
			>
				<stop offset="0%" stopColor="#000000" stopOpacity="0" />
				<stop offset="80%" stopColor="#000000" stopOpacity="0" />
				<stop offset="100%" stopColor="#000000" stopOpacity="0.03" />
			</linearGradient>

			<linearGradient
				id="css-grad-3"
				x1="0%"
				y1="0%"
				x2="0%"
				y2="1.2%"
				spreadMethod="repeat"
			>
				<stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
				<stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
				<stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
			</linearGradient>

			<pattern
				id="stacked-repeating-gradient"
				width="100%"
				height="100%"
				patternUnits="userSpaceOnUse"
			>
				<rect width="100%" height="100%" fill="silver" />
				<rect width="100%" height="100%" fill="url(#css-grad-1)" />
				<rect width="100%" height="100%" fill="url(#css-grad-2)" />
				<rect width="100%" height="100%" fill="url(#css-grad-3)" />
			</pattern>
		</defs>
	)
}

const line = (props: IProps) => {
	const {children: word, kerning, strokeWidth: sw} = props

	/** @note the ratio to adjust pts by to achieve the specified pixel height. */
	const scaleFactor = props.fontSize / 2048

	const letterSpacings = calcLetterSpacings(sw)

	const glyphs = word.trim().split('')

	const glyphWidths = glyphs.map((glyph) => {
		const strokeFn = GLYPH_STROKES?.[glyph]
		if (!strokeFn) return kerning * scaleFactor

		return pts2MaxX(scalePts(scaleFactor, strokeFn(sw).tmp.flat()))
	})

	const height = Math.max(
		...glyphs.map((glyph) => {
			const strokeFn = GLYPH_STROKES?.[glyph]
			if (!strokeFn) return props.fontSize

			return pts2MaxY(scalePts(scaleFactor, strokeFn(sw).tmp.flat()))
		})
	)

	const glyphGaps = word.split('').map((currentGlyph, i, glyphs) => {
		if (!i) return 0 // no prior glyph, zero additional spacing

		const prevGlyph = glyphs[i - 1]
		const glyphPair = prevGlyph + currentGlyph

		return (letterSpacings[glyphPair] ?? sw) * scaleFactor
	})

	const width = sum(glyphWidths) + sum(glyphGaps)

	const tmp = glyphs.flatMap((glyph, i) => {
		const strokeFn = GLYPH_STROKES?.[glyph]
		if (!strokeFn) return []

		const x = sum(glyphWidths.slice(0, i)) + sum(glyphGaps.slice(0, i + 1))
		const strokes = strokeFn(sw).tmp.map((pts, ii) =>
			translatePtsX(x, scalePts(scaleFactor, pts))
		)

		return [{glyph, strokes}]
	})

	return {glyphs: tmp, width, height}
}

const Line = (props: IProps) => {
	const {children, debug = false, kerning, strokeWidth: sw} = props

	/** @note the ratio to adjust pts by to achieve the specified pixel height. */
	const scaleFactor = props.fontSize / 2048

	const letterSpacings = calcLetterSpacings(sw)

	const glyphs = children.trim().split('')

	const glyphWidths = glyphs.map((glyph) => {
		const strokeFn = GLYPH_STROKES?.[glyph]
		if (!strokeFn) return kerning * scaleFactor

		return pts2MaxX(scalePts(scaleFactor, strokeFn(sw).tmp.flat()))
	})

	const height = Math.max(
		...glyphs.map((glyph) => {
			const strokeFn = GLYPH_STROKES?.[glyph]
			if (!strokeFn) return props.fontSize

			return pts2MaxY(scalePts(scaleFactor, strokeFn(sw).tmp.flat()))
		})
	)

	const glyphGaps = children.split('').map((currentGlyph, i, glyphs) => {
		if (!i) return 0 // no prior glyph, zero additional spacing

		const prevGlyph = glyphs[i - 1]
		const glyphPair = prevGlyph + currentGlyph

		return (letterSpacings[glyphPair] ?? sw) * scaleFactor
	})

	const width = sum(glyphWidths) + sum(glyphGaps)

	const tmp = glyphs.flatMap((glyph, i) => {
		const strokeFn = GLYPH_STROKES?.[glyph]
		if (!strokeFn) return []

		const x = sum(glyphWidths.slice(0, i)) + sum(glyphGaps.slice(0, i + 1))
		const strokes = strokeFn(sw).tmp.map((pts, ii) =>
			translatePtsX(x, scalePts(scaleFactor, pts))
		)

		return [{glyph, strokes}]
	})

	// return {glyphs: tmp, width, height}

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${width} ${height}`}
			{...{width, height}}
			style={{height: `${height}px`, width: `${width}px`}}
		>
			<Tmp2dSvgBasedShading />
			{debug && <style>{DEBUG_STYLES}</style>}
			<g stroke="none">
				{tmp.map(({glyph, strokes}, i) => {
					return strokes.map((stroke, ii) => {
						const fill =
							ii === 0 || (['i', ':'].includes(glyph) && ii === 1)
								? `url(#stacked-repeating-gradient)`
								: undefined

						return (
							<path
								key={`${i}-${glyph}-stroke-${ii}`}
								data-glyph={glyph}
								// not zero-index-based for legacy reasons
								data-stroke={ii + 1}
								d={`M${pts2svg(stroke)}z`}
								{...{fill}}
							/>
						)
					})
				})}
			</g>
		</svg>
	)
}

export const NorseRunes = (props: {
	children: ReactNode
	fontSize?: number
	strokeWidth?: number
	debug?: boolean
}) => {
	const {
		children = '',
		fontSize = 12,
		strokeWidth = 192,
		debug = false,
	} = props

	const normalizedChildren = (
		Array.isArray(children) ? children : [children]
	).map((child) =>
		typeof child === 'string'
			? Font({children: child, size: fontSize})
			: (child?.props as IFontProps)
	)

	const defaultKerning = 192 * 2.5
	const simplifiedData = normalizedChildren
		// letter by letter
		.flatMap(({children, size}) =>
			children.split('').map((letter) => ({letter, size}))
		)
		/** @todo ligature support could go here by switching out strings of supported ligatures */
		.map(({letter, size: fontSize}) => {
			const sw = strokeWidth

			/** @note the ratio to adjust pts by to achieve the specified pixel height. */
			const scaleFactor = fontSize! / 2048

			const strokeFn = GLYPH_STROKES?.[letter]

			// unsupported glyph (or letter === ' ')
			if (!strokeFn)
				return {
					letter,
					size: fontSize,

					strokeWidth,
					points: {
						bottomRight: pt(
							defaultKerning * scaleFactor,
							fontSize!
						),
					},
					ridges: [],
					outlines: [],
					faces: [],
				}

			const {points, ridges, outlines, faces} = strokeFn(sw)

			return {
				letter,
				size: fontSize,

				strokeWidth,

				points: objectMap(
					points,
					(pt) => scalePts(scaleFactor, [pt])[0]
				),
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
				prevLetter.size! < letter.size! ? prevLetter : letter

			const scaleFactor = smallestLetter.size! / 2048

			const kerning =
				scaleFactor *
				(calcLetterSpacings(smallestLetter.strokeWidth)[
					potentialLigature
				] ?? smallestLetter.strokeWidth)

			return Object.assign({}, letter, {
				points: objectMap(
					letter.points,
					(pt) => translatePtsX(kerning, [pt])[0]
				),
			})
		})
		// translate all pts horizontally
		.reduce((translatedLetters, letter) => {
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
		}, [])
		// translate all pts vertically (i.e., align them with the largest baseline)
		.map((letter, _, letters) => {
			const maxSize = Math.max(...letters.map((letter) => letter.size))
			if (letter.size === maxSize) return letter

			const v = maxSize - letter.size

			return Object.assign({}, letter, {
				points: objectMap(
					letter.points,
					(pt) => translatePtsY(v, [pt])[0]
				),
			})
		})

	const width = pts2MaxX(Object.values(simplifiedData.slice(-1)[0].points))

	const height = pts2MaxY(
		simplifiedData.map((letter) => Object.values(letter.points)).flat()
	)

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${width} ${height}`}
			{...{width, height}}
			style={{height: `${height}px`, width: `${width}px`}}
		>
			<Tmp2dSvgBasedShading />
			<g stroke="none">
				{simplifiedData.map((letter, i) => {
					return letter.outlines
						.concat(letter.faces)
						.map((ptNames, ii) => {
							const fill =
								ii === 0 ||
								(['i', ':'].includes(letter.letter) && i === 1)
									? `url(#stacked-repeating-gradient)`
									: undefined

							const pts = ptNames.map(
								(ptName) => letter.points[ptName]
							)

							return (
								<path
									key={`${i}:${letter}-stroke:${ii}`}
									d={`M${pts2svg(pts)}z`}
									data-glyph={letter.letter}
									// not zero index-based for legacy reasons
									data-stroke={ii + 1}
									{...{fill}}
								/>
							)
						})
				})}
			</g>
		</svg>
	)
}

/*
const uniqueObjArray = serializerFn => {
	const hashes = []
	
	return (obj, i, objs) => {
		hash = serializerFn(obj)
		if (hashes.includes(hash)) return false

		hashes.push(hash)
		return true
	}
}
const uniquePts = uniqueObjArray(obj => obj.join(','))
const outline = glyph(sw)
const spin = glyph(0)
const faces = outline.flatMap((_,i,{length}) => {
		return i ? [i - 1, i] : [length - 1, i]
	}).map(([i,ii]) => {
		return [spine[i], outline[i], outline[ii], spine[ii]]
			.filter(uniquePts)
	})
 */
