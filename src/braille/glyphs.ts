export type IBrailleGlyph = {
	/** @note a string of digits 1-6 indicating which numbered braille dots are associated each Glyph */
	dots: string
	/** @note overwrites the default coordinates for the specified dots (to move the dots into the center of a rounded path in the glyph). */
	dotFix: Record<string, [number, number]>
	/** @note an array of SVG `<path d="">` values (raw SVG provides greater control over the composition of the glyph). */
	lines: string[]
	/** @note a string of digits 1-6 indicating ??? */
	filled: string
}

const GLYPHS = {
	A: {
		dots: '1',
		dotFix: {1: [128, 128]},
		lines: [
			`M0,2048 v-${2048 - 512} q0,-512,512,-512 q512,0,512,512 v${1024 + 512}`,
			`M0,1024 h1024`,
		],
	},
	B: {
		dots: '12',
		lines: [
			`M0,0 v2048 h512 q512,0,512,-512 q0,-512,-512,-512`,
			`M0,0 h512 q512,0,512,512 q0,512,-512,512 h-256`,
		],
	},
	C: {
		dots: '14',
		dotFix: {1: [128, 128], 4: [1024 - 128, 128]},
		lines: [
			`M1024,${1024 - 256} v-256 q0,-512,-512,-512 q-512,0,-512,512 v1024 q0,512,512,512 q512,0,512,-512 v-256`,
		],
	},
	D: {
		dots: '145',
		dotFix: {4: [1024 - 128, 128]},
		lines: [`M0,2048 v-2048 h512 q512,0,512,512 v1024 q0,512,-512,512z`],
	},
	E: {
		dots: '15',
		lines: [
			`M1024,0 h-1024 v${2048 - 256} q0,256,256,256 h${1048 - 256}`,
			`M1024,1024 h-1024`,
		],
	},
	F: {
		dots: '124',
		lines: [`M1024,0 h-1024 v2048`, `M1024,1024 h-1024`],
	},
	G: {
		dots: '1245',
		dotFix: {1: [128, 128], 4: [1024 - 128, 128]},
		lines: [
			`M1024,512 q0,-512,-512,-512 q-512,0,-512,512 v1024 q0,512,512,512 q512,0,512,-512 v-512 h-512`,
		],
	},
	H: {
		dots: '125',
		lines: [`M0,0 v2048`, `M1024,0 v2048`, `M0,1024 h1024`],
	},
	I: {
		dots: '24',
		filled: '4',
		lines: [`M0,0 h1024`, `M0,2048 h1024`, `M512,0 v2048`],
	},
	J: {
		dots: '245',
		lines: [
			`M0,1024 v512 q0,512,512,512 q512,0,512,-512 v-${1024 + 512} h-512`,
		],
	},
	K: {
		dots: '13',
		lines: [`M0,0 0,2048`, `M0,1024 1024,0`, `M0,1024 1024,2048`],
	},
	L: {
		dots: '123',
		lines: [`M0,0 v${2048 - 256} q0,256,256,256 h${512 + 256}`],
	},
	M: {
		dots: '134',
		dotFix: {1: [64, 64], 4: [1024 - 64, 64]},
		lines: [
			`M0,2048 v-${2048 - 256} q0,-256,256,-256 q256,0,256,256 q0,-256,256,-256 q256,0,256,256 v${2048 - 256}`,
			`M512,128 v${2048 - 128}`,
		],
	},
	N: {
		dots: '1345',
		lines: [
			`M0,2048 v-2048 h256 q256,0,256,256 v${2048 - 512} q0,256,256,256 q256,0,256,-256 v-${2048 - 256}`,
		],
	},
	O: {
		dots: '135',
		dotFix: {1: [128, 128], 3: [128, 2048 - 128]},
		lines: [
			`M512,0 q512,0,512,512 v1024 q0,512,-512,512 q-512,0,-512,-512 v-1024 q0,-512,512,-512`,
		],
	},
	P: {
		dots: '1234',
		dotFix: {4: [1024 - 128, 128]},
		lines: [`M0,2048 v-2048 h512 q512,0,512,512 q0,512,-512,512 h-256`],
	},
	Q: {
		dots: '12345',
		dotFix: {1: [128, 128], 3: [128, 2048 - 128], 4: [1024 - 128, 128]},
		lines: [
			`M512,0 q512,0,512,512 v1024 q0,512,-512,512 q-512,0,-512,-512 v-1024 q0,-512,512,-512`,
			`M512,2048 v256 q0,256,256,256 h256`,
		],
	},
	R: {
		dots: '1235',
		lines: [
			`M0,2048 v-2048 h512 q512,0,512,512 v512 h-1024`,
			`M0,1024 1024,2048`,
		],
	},
	S: {
		dots: '234',
		dotFix: {
			2: [128, 1024 - 128],
			3: [128, 2048 - 128],
			4: [1024 - 128, 128],
		},
		lines: [
			`M1024,512 q0,-512,-512,-512 q-512,0,-512,512 q0,512,512,512 q512,0,512,512 q0,512,-512,512 q-512,0,-512,-512`,
		],
	},
	T: {dots: '2345', filled: '4', lines: [`M0,0 h1024`, `M512,0 v2048`]},
	U: {
		dots: '136',
		dotFix: {3: [128, 2048 - 128], 6: [1024 - 128, 2048 - 128]},
		lines: [
			`M0,0 v${1024 + 512} q0,512,512,512 q512,0,512,-512 v-${1024 + 512}`,
		],
	},
	V: {
		dots: '1236',
		dotFix: {2: [256, 1024]},
		filled: '12',
		lines: [`M0,0 512,2028`, `M1024,0 512,2028`],
	},
	W: {
		dots: '2456',
		dotFix: {6: [1024 - 64, 2048 - 64]},
		lines: [
			`M0,0 v${2048 - 256} q0,256,256,256 q256,0,256,-256 q0,256,256,256 q256,0,256,-256 v-${1024 + 512}`,
			`M512,0 v${2048 - 128}`,
		],
	},
	X: {
		dots: '1346',
		lines: [
			`M0,0 v512 q0,512,512,512 q512,0,512,512 v512`,
			`M1024,0 v512 q0,512,-512,512 q-512,0,-512,512 v512`,
		],
	},
	Y: {
		dots: '13456',
		dotFix: {5: [1024 - 128, 1024 - 128]},
		filled: '145',
		lines: [
			`M0,0 v512 q0,512,512,512 q512,0,512,-512 v-512`,
			`M512,1024 v1024`,
		],
	},
	Z: {
		dots: '1356',
		filled: '136',
		lines: [`M0,0 h1024`, `M1024,0 0,2048`, `M0,2048 h1024`],
	},
	'.': {
		dots: '256',
		filled: '3',
		lines: [],
	},
	// '{': {
	// 	lines: [
	// 		`M0,1024 h256 q256,0,256,256 v512 q0,256,256,256 h256`,
	// 		`M0,1024 h256 q256,0,256,-256 v-512 q0,-256,256,-256 h256`,
	// 	],
	// },
} satisfies Record<string, Partial<IBrailleGlyph>>

export const character2metadata = (char: string): IBrailleGlyph =>
	Object.assign(
		{
			dots: '',
			dotFix: {} as Record<number, [number, number]>,
			filled: '',
			lines: '',
		},
		GLYPHS[char.toLocaleUpperCase() as keyof typeof GLYPHS] ?? {}
	)
