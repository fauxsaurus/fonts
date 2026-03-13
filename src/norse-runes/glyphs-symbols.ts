import {vertical} from './stroke-components'
import {mirrorPtsV, type IPts} from './util'

export const colon = (sw: number): IPts[] => {
	const sw2 = sw / 2 // offset width
	const dot = vertical(sw, sw * 2, 1024 - sw2 * 2)

	return [dot, mirrorPtsV(1024, dot)]
}
