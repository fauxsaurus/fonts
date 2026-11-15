export const DEFAULT_DOT_COORDS = {
	'1': [0, 0],
	'2': [0, 1024],
	'3': [0, 2048],
	'4': [1024, 0],
	'5': [1024, 1024],
	'6': [1024, 2048],
}

export const STROKE_WIDTH = 128

export const GLYPH_HEIGHT = 2048
export const GLYPH_UNIT = GLYPH_HEIGHT / 2 // 1024, used to create a 2x3 matrix
export const GLYPH_WIDTH = GLYPH_UNIT + STROKE_WIDTH * 5
