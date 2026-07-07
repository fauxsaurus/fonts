import * as glyphs from './glyphs'
import {pts2MaxX, pts2MaxY, translatePtsX, type IPt} from './util'

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
		rs: -sw2,
	}
}

const pts2svg = (pts: IPt[]) => pts.map((pt) => pt.join(',')).join(' ')
const sum = (numbers: number[]) => numbers.reduce((a, b) => a + b, 0)

const Line = (props: IProps) => {
	const {children, debug = false, kerning, strokeWidth: sw} = props

	const letterSpacings = calcLetterSpacings(sw)

	const glyphs = children.trim().split('')

	const glyphWidths = glyphs.map((glyph) => {
		const strokeFn = GLYPH_STROKES?.[glyph]
		if (!strokeFn) return kerning

		return pts2MaxX(strokeFn(sw).tmp.flat())
	})

	const height = Math.max(
		...glyphs.map((glyph) => {
			const strokeFn = GLYPH_STROKES?.[glyph]
			if (!strokeFn) return kerning

			return pts2MaxY(strokeFn(sw).tmp.flat())
		})
	)

	const glyphGaps = children.split('').map((currentGlyph, i, glyphs) => {
		if (!i) return 0 // no prior glyph, zero additional spacing

		const prevGlyph = glyphs[i - 1]
		const glyphPair = prevGlyph + currentGlyph

		return letterSpacings[glyphPair] ?? sw
	})

	const width = sum(glyphWidths) + sum(glyphGaps)

	/** Adjusts the height of the svg to maintain a base line of `fontSize`px tall (by elongating the height if there were characters below the ) */
	const proportionalHeight = (height / 2048) * props.fontSize

	// maintain svg aspect ratio
	const proportionalWidth = (width * props.fontSize) / 2048

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${width} ${height}`}
			{...{width, height}}
			style={{
				height: `${proportionalHeight}px`,
				width: `${proportionalWidth}px`,
			}}
		>
			<defs>
				<linearGradient
					id="css-grad-1"
					x1="0%"
					y1="0%"
					x2="0%"
					y2="4.5%"
					spreadMethod="repeat"
				>
					<stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
					<stop
						offset="66.67%"
						stop-color="#ffffff"
						stop-opacity="0"
					/>
					<stop
						offset="100%"
						stop-color="#ffffff"
						stop-opacity="0.1"
					/>
				</linearGradient>

				<linearGradient
					id="css-grad-2"
					x1="0%"
					y1="0%"
					x2="0%"
					y2="2.5%"
					spreadMethod="repeat"
				>
					<stop offset="0%" stop-color="#000000" stop-opacity="0" />
					<stop offset="80%" stop-color="#000000" stop-opacity="0" />
					<stop
						offset="100%"
						stop-color="#000000"
						stop-opacity="0.03"
					/>
				</linearGradient>

				<linearGradient
					id="css-grad-3"
					x1="0%"
					y1="0%"
					x2="0%"
					y2="1.2%"
					spreadMethod="repeat"
				>
					<stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
					<stop offset="50%" stop-color="#ffffff" stop-opacity="0" />
					<stop
						offset="100%"
						stop-color="#ffffff"
						stop-opacity="0.15"
					/>
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
			{debug && <style>{DEBUG_STYLES}</style>}
			<g stroke="none">
				{glyphs.map((glyph, i) => {
					const strokeFn = GLYPH_STROKES?.[glyph]
					if (!strokeFn) return <></>

					const usesOldDataFormat =
						Object.keys(strokeFn(sw).points).length === 0

					const x =
						sum(glyphWidths.slice(0, i)) +
						sum(glyphGaps.slice(0, i + 1))

					return (
						<g
							key={`${glyph}-${i}`}
							data-glyph={glyph}
							opacity={usesOldDataFormat ? 0.1 : 1}
						>
							{strokeFn(sw).tmp.map((pts, i) => {
								return (
									<path
										key={`${glyph}-stroke-${i}`}
										d={`M${pts2svg(translatePtsX(x, pts))}z`}
										{...(i === 0 ||
										(['i', ':'].includes(glyph) && i === 1)
											? {
													fill: `url(#stacked-repeating-gradient)`,
												}
											: {})}
									/>
								)
							})}
						</g>
					)
				})}
			</g>
		</svg>
	)
}

export const NorseRunes = (props: {
	children: string
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

	return (
		<Line
			{...{debug, fontSize}}
			kerning={192 * 2.5}
			strokeWidth={strokeWidth}
		>
			{children}
		</Line>
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
