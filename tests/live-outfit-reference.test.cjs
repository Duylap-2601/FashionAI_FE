const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

const upper = { productId: 'upper', category: 'UPPER', imageUrl: 'https://example.com/upper.png', prompt: 'Red cotton shirt. '.repeat(100) };
const lower = { productId: 'lower', category: 'LOWER', imageUrl: 'https://example.com/lower.png', prompt: 'Blue jeans. '.repeat(100) };

test('outfit reference contains both garments without cropping and releases bitmaps', async () => {
  const draws = [];
  let closed = 0;
  let decoded = 0;
  const output = new Blob(['outfit'], { type: 'image/png' });
  const load = createSourceLoader({ globals: {
    fetch: async () => ({ ok: true, blob: async () => new Blob(['garment'], { type: 'image/png' }) }),
    createImageBitmap: async () => ({ width: 400, height: ++decoded === 1 ? 400 : 800, close: () => closed++ }),
    document: { createElement: () => ({ getContext: () => ({ fillRect() {}, drawImage: (...args) => draws.push(args) }), toBlob: (callback) => callback(output) }) },
  } });
  const { prepareLiveOutfitReference } = load('@/features/try-on/services/live-outfit-reference');
  const result = await prepareLiveOutfitReference(upper, lower, new AbortController().signal);
  assert.equal(result.image, output);
  assert.ok(result.prompt.length <= 700);
  assert.match(result.prompt, /Upper:.*Red cotton/);
  assert.match(result.prompt, /Lower:.*Blue jeans/);
  assert.equal(draws.length, 2);
  assert.ok(draws[0][1] + draws[0][3] <= 512);
  assert.ok(draws[1][1] >= 512);
  assert.equal(draws[1][4] / draws[1][3], 2);
  assert.equal(closed, 2);
});

test('invalid garment pairs are rejected before loading images', async () => {
  const load = createSourceLoader({ globals: { fetch: () => { throw new Error('Should not fetch'); } } });
  const { prepareLiveOutfitReference } = load('@/features/try-on/services/live-outfit-reference');
  await assert.rejects(prepareLiveOutfitReference(upper, upper, new AbortController().signal), /cùng một món/);
  await assert.rejects(prepareLiveOutfitReference({ ...upper, category: 'LOWER' }, lower, new AbortController().signal), /ô Áo chưa phù hợp/);
  await assert.rejects(prepareLiveOutfitReference(upper, { ...lower, category: 'FULL_BODY' }, new AbortController().signal), /ô Quần chưa phù hợp/);
});

test('image download failure does not produce a partial outfit', async () => {
  const load = createSourceLoader({ globals: { fetch: async () => ({ ok: false }) } });
  const { prepareLiveOutfitReference } = load('@/features/try-on/services/live-outfit-reference');
  await assert.rejects(prepareLiveOutfitReference(upper, lower, new AbortController().signal), /Không tải được/);
});
