import { n2xy, xy2n } from './hilbert';

const xy = { x: 0, y: 0 };

for(let i = 0; i < 0x1000000; ++i) {
	const key = Math.floor((Math.random() * 0x100000000 + Math.random()) * 0x10000000);

	n2xy(key >>> 0, (key / 0x100000000) >>> 0, xy);
	const i2 = xy2n(xy.x, xy.y);

	if(key != i2) console.error(key + ' != ' + i2);
}
