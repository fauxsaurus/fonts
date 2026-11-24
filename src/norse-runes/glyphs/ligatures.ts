export const calcLetterSpacings = (sw: number, potentialLigature: string) => {
	const sw2 = sw / 2
	const sw4 = sw / 4

	const perpendicularDiagonals = sw4
	const nestedDiagonals = -sw

	const ligatures = {
		BC: nestedDiagonals,
		be: perpendicularDiagonals,
		bc: perpendicularDiagonals,
		cd: nestedDiagonals,
		dj: sw * -0.75 /** @todo come up with a more exact figure */,
		eG: -sw, // cover-specific
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

	return ligatures?.[potentialLigature as keyof typeof ligatures] ?? sw
}
