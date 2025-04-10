# `@lib/hilbert`

[![npm version](https://badgen.net/npm/v/@lib/hilbert)](https://www.npmjs.com/package/@lib/hilbert)

Convert between 64-bit index along the 2D Hilbert curve and (x, y) coordinates.
Branchless, O(1) and fast thanks to bit parallel algorithm (adding one step doubles number of supported bits).

Install:

```bash
npm install --save @lib/hilbert
```

## API

***ƒ*** `interleave(t: number): number`

Interleave bits with 0, so input bits are stored in odd bits and even bits are zeroed.
Equivalent to Morton code with one coordinate as the input and the other zero.

- `t`: Unsigned 16-bit integer.

***ƒ*** `deinterleave(t: number): number`

De-interleave, dropping even bits and packing the remaining bits into the output.

- `t`: Unsigned 32-bit integer.

***ƒ*** `grayCode(t: number): number`

Compute Gray code, reverse operation of `prefixScan`.

- `t`: Unsigned 32-bit integer.

***ƒ*** `prefixScan(t: number): number`

Reverse operation of grayCode.
Every number becomes the parity of the number ignoring its less significant bits.

- `t`: Unsigned 32-bit integer.

***ƒ*** `n2xy(lo: number, hi: number, xy: { x: number, y: number }): { x: number, y: number }`

Calculate coordinates (x, y) along 2D Hilbert curve at a 64-bit position.

- `hi`: 32 most significant bits of index along curve.
- `lo`: 32 least significant bits of index along curve.
- `xy`: Output object, x and y fields will be set.
- Returns: Given output object.

***ƒ*** `xy2n(x: number, y: number, index?: { lo: number, hi: number }): number`

Calculate 64-bit position along 2D Hilbert curve at coordinates (x, y).
- `x`: X coordinate, unsigned 32-bit integer.
- `y`: Y coordinate, unsigned 32-bit integer.
- `index`: Optional output object, hi and lo fields will be set to accurate 64-bit integer halves.
- Returns: Position along curve accurate to 53 bits.

## Example

Create a file `hilbert.ts`:

```TypeScript
import { n2xy, xy2n } from '@lib/hilbert';

const styles = [
    '\u2800\u2812\u2812\u2812\u2800\u2847\u2812\u2846\u2800\u2856\u2812\u2803\u2800\u2813',
    '\u2597\u2584\u2584\u2584\u2590\u258c\u2584\u2596\u2597\u2584\u259f\u258c\u2590\u2599',
    ' \u2500\u2500\u2500\u2502 \u2510 \u250c\u2500\u2518 \u2514\u2500',
    ' ___|    _| |_'
];

const prev = { x: 0, y: 0 };
const next = { x: 0, y: 0 };
const size = 8;
let pad = '  ';
let out = '\n';

for(let y = 0; y < size; ++y) {
    for(const style of styles) {
        for(let x = 0; x < size; ++x) {
            const n = xy2n(x, y);
            n2xy(n - 1, 0, prev);
            n2xy(n + 1, 0, next);

            const s = (
                (x + y && 2) +
                (((prev.x - x ^ next.x - x) + 2 & 3) * 5 & 6) +
                (prev.y + next.y - y * 2 & 4)
            );

            out += style.substring(s, s + 2);
        }

        out += pad;
    }

    out += '\n';
}

pad += pad + pad;
console.log(out, '<-- Needs more Unicode', pad, pad, pad, 'Needs more monospace -->\n');
```

Run it:

```bash
npx @lib/run hilbert
```

It should print:

```
⠀⠒⠒⡆⠀⡖⠒⠒⠒⡆⠀⡖⠒⠒⠒⡆  ▗▄▄▖▗▄▄▄▄▖▗▄▄▄▄▖   ─┐ ┌───┐ ┌───┐    _   ___   ___
⠀⡖⠒⠃⠀⠓⠒⡆⠀⠓⠒⠃⠀⡖⠒⠃  ▗▄▟▌▐▙▄▖▐▙▟▌▗▄▟▌  ┌─┘ └─┐ └─┘ ┌─┘    _| |_  |_|  _|
⠀⡇⠀⡖⠒⡆⠀⡇⠀⡖⠒⡆⠀⠓⠒⡆  ▐▌▗▄▄▖▐▌▗▄▄▖▐▙▄▖  │ ┌─┐ │ ┌─┐ └─┐   |  _  |  _  |_
⠀⠓⠒⠃⠀⠓⠒⠃⠀⡇⠀⠓⠒⠒⠒⠃  ▐▙▟▌▐▙▟▌▐▌▐▙▄▄▟▌  └─┘ └─┘ │ └───┘   |_| |_| | |___|
⠀⡖⠒⡆⠀⡖⠒⡆⠀⡇⠀⡖⠒⠒⠒⡆  ▗▄▄▖▗▄▄▖▐▌▗▄▄▄▄▖  ┌─┐ ┌─┐ │ ┌───┐    _   _  |  ___
⠀⡇⠀⠓⠒⠃⠀⡇⠀⠓⠒⠃⠀⡖⠒⠃  ▐▌▐▙▟▌▐▌▐▙▟▌▗▄▟▌  │ └─┘ │ └─┘ ┌─┘   | |_| | |_|  _|
⠀⠓⠒⡆⠀⡖⠒⠃⠀⡖⠒⡆⠀⠓⠒⡆  ▐▙▄▖▗▄▟▌▗▄▄▖▐▙▄▖  └─┐ ┌─┘ ┌─┐ └─┐   |_   _|  _  |_
⠀⡖⠒⠃⠀⠓⠒⠒⠒⠃⠀⠓⠒⠒⠒⠃  ▗▄▟▌▐▙▄▄▟▌▐▙▄▄▟▌  ┌─┘ └───┘ └───┘    _| |___| |___|
 <-- Needs more Unicode                      Needs more monospace -->
```

Thanks to [rawrunprotected](https://threadlocalmutex.com/?p=126).

# License

0BSD, which means use as you wish and no need to mention this project or its author. Consider it public domain in practice.
