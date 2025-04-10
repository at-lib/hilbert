/** Singleton scratch variable in case 64-bit output storage is not given. */
const scratchIndex = { lo: 0, hi: 0 };

/** Interleave bits with 0, so input bits are stored in odd bits and even bits are zeroed.
  * Equivalent to Morton code with one coordinate as the input and the other zero.
  *
  * @param t Unsigned 16-bit integer. */

export function interleave(t: number): number {
	t = (t | (t << 8)) & 0x00ff00ff;
	t = (t | (t << 4)) & 0x0f0f0f0f;
	t = (t | (t << 2)) & 0x33333333;
	return (t | (t << 1)) & 0x55555555;
}

/** De-interleave, dropping even bits and packing the remaining bits into the output.
  *
  * @param t Unsigned 32-bit integer. */

export function deinterleave(t: number): number {
	t = t & 0x55555555;
	t = (t | (t >>> 1)) & 0x33333333;
	t = (t | (t >>> 2)) & 0x0f0f0f0f;
	t = (t | (t >>> 4)) & 0x00ff00ff;
	return (t | (t >>> 8)) & 0x0000ffff;
}

/** Compute Gray code, reverse operation of prefixScan.
  *
  * @param t Unsigned 32-bit integer. */

export function grayCode(t: number): number {
	return t ^ (t >>> 1);
}

/** Reverse operation of grayCode.
  * Every number becomes the parity of the number ignoring its less significant bits.
  *
  * @param t Unsigned 32-bit integer. */

export function prefixScan(t: number): number {
	t ^= t >>> 1;
	t ^= t >>> 2;
	t ^= t >>> 4;
	t ^= t >>> 8;
	return t ^ (t >>> 16);
}

/** Calculate coordinates (x, y) along 2D Hilbert curve at a 64-bit position.
  *
  * @param hi 32 most significant bits of index along curve.
  * @param lo 32 least significant bits of index along curve.
  * @param xy Output object, x and y fields will be set.
  * @return Given output object. */

export function n2xy(lo: number, hi: number, xy: { x: number, y: number }): { x: number, y: number } {
	const odd = (deinterleave(hi) << 16) | deinterleave(lo);
	const even = (deinterleave(hi >>> 1) << 16) | deinterleave(lo >>> 1);

	xy.x = (
		(odd & prefixScan(~(odd | even))) ^
		(~odd & prefixScan(odd & even)) ^
		even
	);

	xy.y = xy.x ^ odd;
	return xy;
}

/** Calculate 64-bit position along 2D Hilbert curve at coordinates (x, y).
  *
  * @param x X coordinate, unsigned 32-bit integer.
  * @param y Y coordinate, unsigned 32-bit integer.
  * @param index Optional output object, hi and lo fields will be set to accurate 64-bit integer halves.
  * @return Position along curve accurate to 53 bits. */

export function xy2n(x: number, y: number, index?: { lo: number, hi: number }): number {
	const odd = x ^ y;

	let a = x & ~y;
	let b = ~(x | y);

	let t = a >>> 1;
	a ^= (odd & (b >>> 1)) ^ t;
	b ^= (b >>> 1) ^ (t & ~odd);

	let c = (odd >>> 1) ^ odd;
	let d = odd | ~odd >>> 1;

	t = a >>> 2;
	a ^= (c & (b >>> 2)) ^ (t & (d ^ c));
	b ^= (d & (b >>> 2)) ^ (t & c);

	t = c;
	c = (d & (c >>> 2)) ^ (c & ((d ^ c) >>> 2));
	d = (d & (d >>> 2)) ^ (t & (t >>> 2));

	t = a >>> 4;
	a ^= (c & (b >>> 4)) ^ (t & (d ^ c));
	b ^= (d & (b >>> 4)) ^ (t & c);

	t = c;
	c = (d & (c >>> 4)) ^ (c & ((d ^ c) >>> 4));
	d = (d & (d >>> 4)) ^ (t & (t >>> 4));

	t = a >>> 8;
	a ^= (c & (b >>> 8)) ^ (t & (d ^ c));
	b ^= (d & (b >>> 8)) ^ (t & c);

	t = c;
	c = (d & (c >>> 8)) ^ (c & ((d ^ c) >>> 8));
	d = (d & (d >>> 8)) ^ (t & (t >>> 8));

	t = a >>> 16;
	a ^= (c & (b >>> 16)) ^ (t & (d ^ c));
	b ^= (d & (b >>> 16)) ^ (t & c);

	const even = grayCode(a) | ~(odd | grayCode(b));

	index = index || scratchIndex;
	index.hi = interleave(even >> 16) * 2 + interleave(odd >> 16);
	index.lo = interleave(even & 0xffff) * 2 + interleave(odd & 0xffff)

	// All intermediates are 32 bits until here. Interleave them into 64-bit output.
	return index.hi * 0x100000000 + index.lo;
}
