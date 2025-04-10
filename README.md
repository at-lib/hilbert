# `@lib/hilbert`

[![npm version](https://badgen.net/npm/v/@lib/hilbert)](https://www.npmjs.com/package/@lib/hilbert)

Convert between 64-bit index along the 2D Hilbert curve and (x, y) coordinates.
Branchless, O(1) and fast thanks to bit parallel algorithm (adding one step doubles number of supported bits).

Install:

```bash
npm install --save @lib/hilbert
```

Now create a file `hilbert.ts`:

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

            const s = (x + y && 2) + (((prev.x - x ^ next.x - x) + 2 & 3) * 5 & 6) + (prev.y + next.y - y * 2 & 4);

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
