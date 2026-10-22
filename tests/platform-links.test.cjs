const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/load-source.cjs');

const load = createSourceLoader();
const { buildPlatformLink, normalizeCampaign, PLATFORM_LINK_OPTIONS } = load('@/features/admin/services/platform-links');

test('builds a UTM link for each platform', () => {
  assert.equal(
    buildPlatformLink({ baseUrl: 'https://shop.vn', platform: 'tiktok', campaign: 'bio' }),
    'https://shop.vn/?utm_source=tiktok&utm_medium=social&utm_campaign=bio',
  );
  assert.deepEqual(
    PLATFORM_LINK_OPTIONS.map((option) => option.value).join(','),
    'tiktok,facebook,instagram,zalo,youtube,threads,x,shopee',
  );
});

test('normalizes campaign names and keeps existing query params', () => {
  assert.equal(normalizeCampaign('  Tết 2027 / Sale  '), 'tet-2027-sale');
  assert.equal(
    buildPlatformLink({ baseUrl: 'https://shop.vn/sale?ref=home', platform: 'facebook', campaign: 'Tết' }),
    'https://shop.vn/sale?ref=home&utm_source=facebook&utm_medium=social&utm_campaign=tet',
  );
});

test('adds https when the base URL has no scheme and drops an empty campaign', () => {
  assert.equal(
    buildPlatformLink({ baseUrl: 'shop.vn', platform: 'instagram', campaign: '   ' }),
    'https://shop.vn/?utm_source=instagram&utm_medium=social',
  );
});

test('returns an empty link for an invalid or missing base URL', () => {
  assert.equal(buildPlatformLink({ baseUrl: '', platform: 'tiktok', campaign: 'bio' }), '');
  assert.equal(buildPlatformLink({ baseUrl: 'http://', platform: 'tiktok', campaign: 'bio' }), '');
});
