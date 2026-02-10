// @todo Draw a red line from the upper Y coord of G under each letter throughout each line of text. Draw a similar line for the lower bound. And center. Stretch out the upper points to align with the upper bound of G (title letters first, then all).Lower the bounds of all letters. Establish lower case consistency for qp with gjy. Alter BPR point widths (using coords below). Try to adjust letter widths for more consistency.

// @todo try using this B out when the upper and lower bounds are stretched to match the G outlier points (apply it ot P and R as well)
// B: ['0,0 0,4', '0,1.5, 1.25,2.75 0,4', '0,0 1.25,1.25 0,2.5'],
//a: ['1.25,4 0,2.75 1.25,1.5, 2.5,2.75 1.25,4', '2.5,1.5 2.5,4'],

// goal: extend lines upward to do this, find the upper y coord in G and note its relationship with 0.
// then subtract 1/2 stroke width to come up with the upper bound //

// @todo fine-tunings: (get the diagonal of "r" to line up with the top of its vertical line); get the vertical line in "a" to line up with the diamond-shape (difference due to offsetWidth (the width of the vertical line) not equalling strokeWidth/sqrt(2) (the width of the diamond on the corners)), fix the shape of the s to be the historical proportions

/**
 * Calculates the ideal Y coordinate for point A such that the outer point A'
 * lands exactly at the specified yLimit (the upper coordinate bound).
 * * Logic based on the vertical projection Y = E / tan(theta/2).
 * * @param E - The offset distance (thickness).
 * @param thetaDegrees - The angle theta in degrees.
 * @param yLimitAPrime - The maximum Y coordinate (bottom bound) for A'.
 * @returns The calculated Y coordinate for A.
 */
function calculateIdealAy(
	E: number,
	thetaDegrees: number,
	yLimitAPrime: number
): number {
	// Normalize angle to 0-360 to handle inputs safely
	const theta = thetaDegrees % 360

	// Edge Case: 0 degrees (Parallel lines)
	// The intersection is at infinity.
	if (theta === 0) {
		return -Infinity
	}

	// Edge Case: 180 degrees (Flat line)
	// The tangent of 90 is infinity, so the vertical offset is 0.
	if (theta === 180) {
		return yLimitAPrime
	}

	// Convert degrees to radians
	// Use half-angle as per the geometric derivation
	const halfAngleRadians = (theta / 2) * (Math.PI / 180)

	// Calculate the vertical offset (Y in your diagram)
	// Formula: Y = E / tan(theta/2)
	const verticalOffset = E / Math.tan(halfAngleRadians)

	// In Canvas coordinates (Y increases down):
	// A' is below A (larger Y value).
	// Therefore: Ay = A'y - verticalOffset
	return yLimitAPrime - verticalOffset
}

// --- Usage Example ---
// const E = 10;
// const theta = 60;
// const bottomLimit = 500;
// const idealAy = calculateIdealAy(E, theta, bottomLimit);
// Result: 500 - 17.32 = 482.68

/**
 * Calculates the vertical extension distance Y based on offset E and angle Theta.
 * * @param E - The offset distance (thickness/radius).
 * @param degrees - The angle between the two lines in degrees.
 * @returns The distance Y. Returns Infinity if lines are parallel (0 deg).
 */
const getOuterYoffset = (E: number, degrees: number) => {
	const ERRORS = {
		overlap: 'C should not equal A in angle ABC',
		straight: 'Three consecutive points should not be in a straight line',
	}

	const theta = degrees % 360 // normalize to 0-360
	if (theta === 0) console.warn(ERRORS.overlap)
	if (theta === 180) console.warn(ERRORS.straight)
	if (theta % 180) return E

	const bisectedAngle = theta / 2
	// degrees2radians
	const halfAngleRadians = bisectedAngle * (Math.PI / 180)

	return E / Math.tan(halfAngleRadians)
}

// --- Examples ---
// const y1 = calculateY(10, 60);  // Returns ~17.32 (Factor of 1.732)
// const y2 = calculateY(10, 90);  // Returns 10.0
// const y3 = calculateY(10, 120); // Returns ~5.77

export const STROKE_WIDTH = 200 // 204.8 = same the same ratio as 100 to a 1000-based grid for a new, 2048-based grid

type IRadians = number

/** @return number (the distance between the original centerpoint and the outer edge of the rune given the strokeWidth of the glyph) */
const angle2offset = (angle: IRadians, strokeWidth: number) => {
	const offsetWidth = strokeWidth / 2

	return Math.abs(offsetWidth / Math.sin(angle / 2))
}

export const calcRuneCoords2 = (strokeWidth: number) => {
	const offsetWidth = strokeWidth / 2 // 90 degree triangle height used to extend pts

	const deg2Offset = (deg: number) => {
		const radians = deg * (Math.PI / 2)
		const offsetWidth = strokeWidth / 2

		return Math.abs(offsetWidth / Math.tan(radians / 2))
	}

	const offset45 = 2048 - calculateIdealAy(offsetWidth, 45, 2048)
	const offset90 = 2048 - calculateIdealAy(offsetWidth, 90, 2048)

	const GOffset = deg2Offset(45)

	const lowercaseOOffset = strokeWidth / Math.SQRT2

	const tipOfGOverhang = 1024 - offset45 - offsetWidth

	const offsetLowercaseSTips = (offsetWidth * Math.SQRT2) / 2
	const offsetLowercaseSJointLength = 512 / Math.SQRT2

	// @todo align tops/bottoms ABCDEFHIJKLMNOPQRSTUVWXYZabcdefgjkmnopqstuvwxyz:_
	// @todo re-proportion a(upper pt of vertical line)n(upper diagonal)os_

	// offsets used to get the corner extending from the outer most center point Y values to line up exactly with those of G (for consistent character sizing)
	const offsetVerticalLine = GOffset

	// const offset90 = deg2Offset(90) // "o" corners
	// const offset135 =
	// 	angle2offset(135 * (Math.PI / 2), strokeWidth) +
	// 	offsetWidth / 2 / Math.SQRT2 // top and bottom of "s" whose end triangle sides are completely horizontal

	return {
		// A: [
		// 	[
		// 		[0, 2048],
		// 		[0, 0],
		// 		[1024, 512],
		// 		[1024, 2048],
		// 	],
		// 	[
		// 		[0, 512],
		// 		[1024, 1024],
		// 	],
		// ],
		// B: [
		// 	[
		// 		[0, offsetVerticalLine],
		// 		[0, 2048],
		// 		[1024, 1536],
		// 		[0, 1024],
		// 		[1024, 512],
		// 		[0, 0],
		// 	],
		// ],
		// C: [
		// 	[
		// 		[1024, 0],
		// 		[0, 1024],
		// 		[1024, 2048],
		// 	],
		// ],
		// D: [
		// 	[
		// 		[0, 0],
		// 		[0, 2048],
		// 		[1024, 1024],
		// 		[0, 0],
		// 	],
		// ],
		// E: [
		// 	[
		// 		[1024, 0],
		// 		[0, 1024],
		// 		[1024, 2048],
		// 	],
		// 	[
		// 		[0, 1024],
		// 		[1024, 1024],
		// 	],
		// ],
		// F: [
		// 	[
		// 		[0, offsetVerticalLine],
		// 		[0, 2048],
		// 	],
		// 	[
		// 		[1024, 0],
		// 		[0, 1024],
		// 	],
		// 	[
		// 		[512, 0],
		// 		[0, 512],
		// 	],
		// ],
		$: [
			[
				[1024, 512],
				[1024, 0],
				[0, 1024],
				[1024, 2048],
				[1024, 1024],
				[512, 1024],
			],
		],

		G: [
			[
				[1024 - offset45, tipOfGOverhang],
				[1024 - offset45, 0 + offset45],
				[0, 1024],
				[1024 - offset45, 2048 - offset45],
				[1024 - offset45, 1024],
				[512, 1024],
			],

			// [
			// 	[1024 * 0.76, 512 * 0.76 + GOffset],
			// 	[1024 * 0.76, GOffset * 1.7],
			// 	[0, 1024],
			// 	[1024 * 0.76, 2048 - GOffset * 1.7],
			// 	[1024 * 0.76, 1024],
			// 	[512 * 0.76, 1024],
			// ],
		],
		// H: [
		// 	[
		// 		[0, offsetVerticalLine],
		// 		[0, 2048],
		// 	],
		// 	[
		// 		[1024, offsetVerticalLine],
		// 		[1024, 2048],
		// 	],
		// 	[
		// 		[0, 512],
		// 		[1024, 512],
		// 	],
		// 	[
		// 		[0, 1024],
		// 		[1024, 1024],
		// 	],
		// ],
		// I: [
		// 	[
		// 		[0, 512],
		// 		[512, 0],
		// 		[512, 2048],
		// 		[1024, 1536],
		// 	],
		// ],
		// J: [
		// 	[
		// 		[1024, offsetVerticalLine],
		// 		[1024, 2048],
		// 		[offsetVerticalLine, 1536],
		// 	],
		// ],
		// K: [
		// 	[
		// 		[0, offsetVerticalLine],
		// 		[0, 2048],
		// 	],
		// 	[
		// 		[1024, offsetVerticalLine],
		// 		[0, 1024],
		// 		[1024, 2048],
		// 	],
		// ],
		// L: [
		// 	[
		// 		[0, offsetVerticalLine],
		// 		[0, 2048],
		// 		[1024, 1536],
		// 	],
		// ],
		// M: [
		// 	[
		// 		[0, 2048],
		// 		[0, 0],
		// 		[1024, 512],
		// 		[1024, 2048],
		// 	],
		// 	[
		// 		[512, 256],
		// 		[512, 2048],
		// 	],
		// ],
		// N: [
		// 	[
		// 		[0, 2048],
		// 		[0, 0],
		// 		[1024, 512],
		// 		[1024, 2048],
		// 	],
		// ],
		// O: [
		// 	[
		// 		[512, 0],
		// 		[1024, 1024],
		// 		[512, 2048],
		// 		[0, 1024],
		// 		[512, 0],
		// 	],
		// ],
		// P: [
		// 	[
		// 		[0, offsetVerticalLine],
		// 		[0, 2048],
		// 	],
		// 	[
		// 		[0, 0],
		// 		[1024, 512],
		// 		[0, 1024],
		// 	],
		// ],
		// Q: [
		// 	[
		// 		[512, 0],
		// 		[1024, 1024],
		// 		[512, 2048],
		// 		[0, 1024],
		// 		[512, 0],
		// 	],
		// 	[
		// 		[512, 1024],
		// 		[1024, 2048],
		// 	],
		// ],
		// R: [
		// 	[
		// 		[0, offsetVerticalLine],
		// 		[0, 2048],
		// 	],
		// 	[
		// 		[1024, 2048],
		// 		[0, 1024],
		// 		[1024, 512],
		// 		[0, 0],
		// 	],
		// ],
		// S: [
		// 	[
		// 		[0, 2048],
		// 		[680.96, 1367.04],
		// 		[0, 680.96],
		// 		[680.96, 0],
		// 	],
		// ],
		// T: [
		// 	[
		// 		[0, 512],
		// 		[512, 0],
		// 		[1024, 512],
		// 	],
		// 	[
		// 		[512, 0],
		// 		[512, 2048],
		// 	],
		// ],
		// U: [
		// 	[
		// 		[0, offsetVerticalLine],
		// 		[0, 2048],
		// 		[1024, 1536],
		// 		[1024, offsetVerticalLine],
		// 	],
		// ],
		// V: [
		// 	[
		// 		[0, 0],
		// 		[512, 2048],
		// 		[1024, 0],
		// 	],
		// ],
		// W: [
		// 	[
		// 		[0, offsetVerticalLine],
		// 		[0, 2048],
		// 		[1024, 1536],
		// 		[1024, offsetVerticalLine],
		// 	],
		// 	[
		// 		[512, offsetVerticalLine],
		// 		[512, 1792],
		// 	],
		// ],
		// X: [
		// 	[
		// 		[0, 0],
		// 		[1024, 2048],
		// 	],
		// 	[
		// 		[0, 2048],
		// 		[1024, 0],
		// 	],
		// ],
		// Y: [
		// 	[
		// 		[0, 0],
		// 		[512, 512],
		// 		[1024, 0],
		// 	],
		// 	[
		// 		[512, 512],
		// 		[512, 2048],
		// 	],
		// ],
		// Z: [
		// 	[
		// 		[680.96, 2048],
		// 		[0, 1367.04],
		// 		[680.96, 680.96],
		// 		[0, 0],
		// 	],
		// ],
		a: [
			// [
			// 	[1024, 1536 + offset90],
			// 	[512, 1024 + offset90],
			// 	[0, 1536 + offset90],
			// 	[512, 2048 + offset90],
			// 	[1024, 1536 + offset90],
			// 	[512, 1024 + offset90],
			// ],

			[
				[1024 - lowercaseOOffset * 2, 1536],
				[512 - lowercaseOOffset, 1024 + lowercaseOOffset],
				[0, 1536],
				[512 - lowercaseOOffset, 2048 - lowercaseOOffset],
				[1024 - lowercaseOOffset * 2, 1536],
				[512 - lowercaseOOffset, 1024 + lowercaseOOffset],
			],

			[
				[
					1024 - lowercaseOOffset * 2 + offsetWidth / 2,
					1024 + offsetWidth,
				],
				[
					1024 - lowercaseOOffset * 2 + offsetWidth / 2,
					2048 - offsetWidth,
				],
			],
		],
		b: [
			[
				[0, offsetWidth],
				[0, 2048 - offset45],
				[512, 1024 + 512 - offset45],
				[0, 1024 - offset45],
			],
		],
		// c: [
		// 	[
		// 		[640, 2048],
		// 		[0, 1408],
		// 		[640, 768],
		// 	],
		// ],
		d: [
			[
				[512, offsetWidth],
				[512, 2048 - offset45],
				[0, 1024 + 512 - offset45],
				[512, 1024 - offset45],
			],

			// [
			// 	[offsetLowercaseSTips, 1024 + offsetLowercaseSTips],
			// 	[512, 1024 + 512],
			// 	[offsetLowercaseSTips, 2048 - offsetLowercaseSTips],
			// ],

			// [
			// 	[512 + offsetLowercaseSTips, offsetWidth],
			// 	[512 + offsetLowercaseSTips, 2048 - offsetWidth],
			// ],
			// [
			// 	[512 + offsetLowercaseSTips, 1024 + offsetLowercaseSTips],
			// 	[0, 1024 + 512],
			// 	[512 + offsetLowercaseSTips, 2048 - offsetLowercaseSTips],
			// ],
		],
		e: [
			[
				[640, 2048],
				[0, 1408],
				[640, 768],
			],
			[
				[0, 1408],
				[640, 1408],
			],
		],
		f: [
			// t: [
			// 		// 45 degrees
			// 		[
			// 			[0, offsetWidth],
			// 			[0, 2048 - offset45],
			// 			[512, 1024 + 512 - offset45],
			// 		],
			// 		[
			// 			[0, 1024],
			// 			[512, 1024],
			// 		],
			// 	],

			[
				[512, 512 + offset45],
				[0, 0 + offset45],
				[0, 2048 - offsetWidth],
			],
			[
				[0, 1024],
				[512, 1024],
			],
		],
		// g: [
		// 	[
		// 		[640, 768],
		// 		[640, 3072],
		// 		[0, 2560],
		// 	],
		// 	[
		// 		[640, 2048],
		// 		[0, 1408],
		// 		[640, 768],
		// 	],
		// ],
		h: [
			[
				[0, 0 + offsetWidth],
				[0, 2048 - offsetWidth],
			],
			[
				[0, 1024],
				[1024 * 0.76, (2048 / 8) * 5],
				[1024 * 0.76, 2048 - offsetWidth],
			],
		],
		i: [
			[
				[0, tipOfGOverhang - offsetWidth * 2],
				[0, tipOfGOverhang],
			],
			[
				[0, 1024],
				[0, 2048 - offset45],
				[512, 1024 + 512 - offset45],
			],
		],
		// j: [
		// 	[
		// 		[512, offsetVerticalLine],
		// 		[512, 512 - offsetWidth],
		// 	],
		// 	[
		// 		[512, 1024],
		// 		[512, 3072],
		// 		[0, 2560],
		// 	],
		// ],
		// k: [
		// 	[
		// 		[0, offsetVerticalLine],
		// 		[0, 2048],
		// 	],
		// 	[
		// 		[640, 2048],
		// 		[0, 1408],
		// 		[640, 768],
		// 	],
		// ],
		l: [
			// 45 degrees
			[
				[0, offsetWidth],
				[0, 2048 - offset45],
				[512, 1024 + 512 - offset45],
			],
		],
		// m: [
		// 	[
		// 		[0, 1024],
		// 		[0, 2048],
		// 	],
		// 	[
		// 		[512, 1280],
		// 		[512, 2048],
		// 	],
		// 	[
		// 		[1024, 1536],
		// 		[1024, 2048],
		// 	],
		// 	[
		// 		[0, 1024],
		// 		[1024, 1536],
		// 	],
		// ],
		n: [
			[
				[0, 2028 - offsetWidth],
				[0, 1024],
				[1024 * 0.76, (2048 / 8) * 5],
				[1024 * 0.76, 2048 - offsetWidth],
			],
		],
		o: [
			[
				[0, 1024 + 512 - strokeWidth / Math.SQRT2],
				[512, 1024 - strokeWidth / Math.SQRT2],
				[1024, 1024 + 512 - strokeWidth / Math.SQRT2],
				[512, 2048 - strokeWidth / Math.SQRT2],

				[0, 1024 + 512 - strokeWidth / Math.SQRT2],
				[512, 1024 - strokeWidth / Math.SQRT2],
			],
		],
		// p: [
		// 	[
		// 		[0, 768],
		// 		[0, 3072],
		// 	],
		// 	[
		// 		[0, 768],
		// 		[640, 1408],
		// 		[0, 2048],
		// 	],
		// ],
		// q: [
		// 	[
		// 		[640, 768],
		// 		[640, 3072],
		// 	],
		// 	[
		// 		[640, 2048],
		// 		[0, 1408],
		// 		[640, 768],
		// 	],
		// ],
		r: [
			[
				[0, 1024],
				[0, 2048 - offsetWidth],
			],
			[
				[0, 1024 + 512],
				[512, 1024],
			],
			// 	[
			// 	[0, 768],
			// 	[0, 2048 + offsetVerticalLine],
			// ],
			// [
			// 	[0, 1280],
			// 	[512, 768],
			// ],
		],
		s: [
			[
				[640, 1024 + offsetLowercaseSTips],
				[0, 1024 + 512],
				[640, 1024 + 512],
				[0, 2048 - offsetLowercaseSTips],
			],
		],
		t: [
			// 45 degrees
			[
				[0, offsetWidth],
				[0, 2048 - offset45],
				[512, 1024 + 512 - offset45],
			],
			[
				[0, 1024],
				[512, 1024],
			],
		],
		// u: [
		// 	[
		// 		[0, 1024],
		// 		[0, 2048],
		// 		[1024, 1536],
		// 		[1024, 1024],
		// 	],
		// ],
		// v: [
		// 	[
		// 		[0, 1024],
		// 		[512, 2048],
		// 		[1024, 1024],
		// 	],
		// ],
		// w: [
		// 	[
		// 		[0, 1024],
		// 		[0, 2048],
		// 		[1024, 1536],
		// 		[1024, 1024],
		// 	],
		// 	[
		// 		[512, 1792],
		// 		[512, 1024],
		// 	],
		// ],
		// x: [
		// 	[
		// 		[0, 1024],
		// 		[1024, 2048],
		// 	],
		// 	[
		// 		[0, 2048],
		// 		[1024, 1024],
		// 	],
		// ],
		// y: [
		// 	[
		// 		[896, 768],
		// 		[896, 3072],
		// 		[256, 2560],
		// 	],
		// 	[
		// 		[896, 1792],
		// 		[0, 896],
		// 	],
		// ],
		// z: [
		// 	[
		// 		[0, 768],
		// 		[640, 1408],
		// 		[0, 1408],
		// 		[640, 2048],
		// 	],
		// ],
		// '-': [
		// 	[
		// 		[0, 1024],
		// 		[1024, 1024],
		// 	],
		// ],
		// ':': [
		// 	[
		// 		[0, 128],
		// 		[0, 640],
		// 	],
		// 	[
		// 		[0, 1408],
		// 		[0, 1920],
		// 	],
		// ],
		// '.': [
		// 	[
		// 		[0, 1536],
		// 		[0, 2048],
		// 	],
		// ],
		// _: [
		// 	[
		// 		[0, 2048],
		// 		[1024, 2048],
		// 	],
		// ],
		' ': [
			[
				[0, 2048 - offsetWidth],
				[1024, 2048 - offsetWidth],
			],
		],
	}
}
