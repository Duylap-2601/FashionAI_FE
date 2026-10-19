const assert = require('node:assert/strict');
const test = require('node:test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { createSourceLoader } = require('./helpers/load-source.cjs');

const load = createSourceLoader();
const { POLICY_NAV_ITEMS } = load('@/features/policies/constants/policy-nav');
const policies = [
  load('@/features/policies/constants/return-policy').RETURN_POLICY,
  load('@/features/policies/constants/warranty-policy').WARRANTY_POLICY,
  load('@/features/policies/constants/size-guide').SIZE_GUIDE,
  load('@/features/policies/constants/privacy-policy').PRIVACY_POLICY,
  load('@/features/policies/constants/terms-of-service').TERMS_OF_SERVICE,
];

test('every policy in the nav has a document and a matching route', () => {
  // Array.from copies out of the loader's vm realm so deepEqual compares values.
  assert.deepEqual(
    Array.from(POLICY_NAV_ITEMS, (item) => item.slug).sort(),
    policies.map((policy) => policy.slug).sort(),
  );
  for (const item of POLICY_NAV_ITEMS) assert.equal(item.href, `/${item.slug}`);
});

test('policy sections have unique anchors and well-formed tables', () => {
  for (const policy of policies) {
    const ids = policy.sections.map((section) => section.id);
    assert.equal(new Set(ids).size, ids.length, `${policy.slug} has duplicate section ids`);
    for (const section of policy.sections) {
      assert.ok(section.blocks.length > 0, `${policy.slug}#${section.id} is empty`);
      for (const block of section.blocks) {
        if (block.type !== 'table') continue;
        // Row keys use the first cell, so it must be unique within a table.
        assert.equal(new Set(block.rows.map((row) => row[0])).size, block.rows.length);
        for (const row of block.rows) assert.equal(row.length, block.columns.length, `${policy.slug}#${section.id}`);
      }
    }
  }
});

test('size guide tables follow the measurement form and the reference size chart', () => {
  const measurements = load('@/features/measurements/constants/profile-measurements-page');
  const guide = policies.find((policy) => policy.slug === 'size-guide');
  const upper = guide.sections.find((section) => section.id === 'than-tren').blocks[0];
  assert.deepEqual(upper.rows.map((row) => row[0]), measurements.UPPER_FIELDS.map((field) => field.label));
  const sizes = guide.sections.find((section) => section.id === 'bang-size').blocks[1];
  assert.deepEqual(sizes.rows.map((row) => row[0]), measurements.SHIRT_SIZES);
});

test('PolicyPage renders the title, numbered sections and marks the active policy', () => {
  const { PolicyPage } = load('@/features/policies/components/policy-page');
  const policy = policies[0];
  const html = renderToStaticMarkup(React.createElement(PolicyPage, { policy }));

  assert.match(html, new RegExp(`<h1[^>]*>${policy.title}</h1>`));
  for (const section of policy.sections) {
    assert.match(html, new RegExp(`<section[^>]*id="${section.id}"`));
    assert.match(html, new RegExp(`href="#${section.id}"`));
  }
  assert.match(html, /aria-current="page"[^>]*href="\/return-policy"|href="\/return-policy"[^>]*aria-current="page"/);
  assert.doesNotMatch(html, /aria-current="page"[^>]*href="\/terms"|href="\/terms"[^>]*aria-current="page"/);
  assert.match(html, /href="\/profile\/orders"/);
});
