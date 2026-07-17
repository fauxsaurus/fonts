import type {ReactNode} from 'react'
import * as glyphs from './glyphs'
import {
	pt,
	pts2MaxX,
	pts2MaxY,
	translatePtsX,
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
				<stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
				<stop offset="66.67%" stop-color="#ffffff" stop-opacity="0" />
				<stop offset="100%" stop-color="#ffffff" stop-opacity="0.1" />
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
				<stop offset="100%" stop-color="#000000" stop-opacity="0.03" />
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
				<stop offset="100%" stop-color="#ffffff" stop-opacity="0.15" />
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
				{glyphs.map((glyph, i) => {
					const strokeFn = GLYPH_STROKES?.[glyph]
					if (!strokeFn) return <></>

					const x =
						sum(glyphWidths.slice(0, i)) +
						sum(glyphGaps.slice(0, i + 1))

					return strokeFn(sw).tmp.map((pts, ii) => {
						pts = scalePts(scaleFactor, pts)

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
								d={`M${pts2svg(translatePtsX(x, pts))}z`}
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
			? Font({children: child})
			: (child?.props as IFontProps)
	)

	return (
		<>
			{normalizedChildren.map(({children}, i) => (
				<Line
					key={i}
					{...{debug, fontSize}}
					kerning={192 * 2.5}
					strokeWidth={strokeWidth}
				>
					{children}
				</Line>
			))}
		</>
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
