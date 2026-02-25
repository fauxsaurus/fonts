import {mirrorPtsV, type IPts} from './util'

/** @note LINES
 * ASCENDER LINE (top, Cap Height)
 * MIDLINE (lowercase top, x Height)
 * BASELINE (un-DESCENDed lowercase bottom)
 * DESCENDER LINE
 */

export const tip = (sw: number): IPts => {
	const sw2 = sw / 2

	return [[0, sw2], [sw2, 0], [sw, sw2]] // prettier-ignore
}

export const verticalAscender2Base = (sw: number): IPts =>
	tip(sw).concat(mirrorPtsV(1024, tip(sw)).reverse())
