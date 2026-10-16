const test = require('node:test');
const assert = require('node:assert');
const { createSourceLoader } = require('./helpers/load-source.cjs');

const load = createSourceLoader();
const u = load('@/components/tables/table-utils');

// Objects returned by the source loader are created inside a vm realm, so their
// prototypes differ from the test realm and `deepStrictEqual` rejects them. Round-trip
// through JSON to compare structure only.
function eq(actual, expected, message) {
  const norm = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  assert.deepStrictEqual(norm(actual), norm(expected), message);
}

test('computeStt numbers rows per page from pageIndex and position', () => {
  assert.strictEqual(u.computeStt(0, 10, 0), 1);
  assert.strictEqual(u.computeStt(0, 10, 9), 10);
  assert.strictEqual(u.computeStt(1, 10, 0), 11);
  assert.strictEqual(u.computeStt(2, 20, 5), 46);
});

test('normalizeSearch strips diacritics and maps đ -> d', () => {
  assert.strictEqual(u.normalizeSearch('đầm'), 'dam');
  assert.strictEqual(u.normalizeSearch('Đầm'), 'dam');
  assert.strictEqual(u.normalizeSearch('Áo sơ mi'), 'ao so mi');
  assert.strictEqual(u.normalizeSearch('ĐÀ NẴNG'), 'da nang');
});

test('matchesSearch ignores case and diacritics', () => {
  assert.strictEqual(u.matchesSearch('Đầm dạ hội', 'dam'), true);
  assert.strictEqual(u.matchesSearch('Áo khoác', 'ao khoac'), true);
  assert.strictEqual(u.matchesSearch('Quần jean', 'dress'), false);
  assert.strictEqual(u.matchesSearch('anything', ''), true);
});

test('applyFilters ANDs across fields and ORs within a multi-select', () => {
  const rows = [
    { id: '1', status: 'ACTIVE', color: 'red' },
    { id: '2', status: 'ACTIVE', color: 'blue' },
    { id: '3', status: 'DRAFT', color: 'red' },
  ];
  const byStatus = (row, id) => row[id];

  // single select
  eq(
    u.applyFilters(rows, { status: 'ACTIVE' }, byStatus).map((r) => r.id),
    ['1', '2'],
  );

  // multi-select OR within the field
  eq(
    u.applyFilters(rows, { status: ['ACTIVE', 'DRAFT'] }, byStatus).map((r) => r.id),
    ['1', '2', '3'],
  );

  // AND across two fields
  eq(
    u.applyFilters(rows, { status: 'ACTIVE', color: 'red' }, byStatus).map((r) => r.id),
    ['1'],
  );

  // inactive (empty) filters are skipped
  eq(
    u.applyFilters(rows, { status: [], color: null }, byStatus).map((r) => r.id),
    ['1', '2', '3'],
  );
});

test('applyFilters boolean and date-range semantics', () => {
  const rows = [
    { id: '1', published: true, at: '2024-01-10' },
    { id: '2', published: false, at: '2024-03-15' },
    { id: '3', published: true, at: '2024-06-01' },
  ];
  const get = (row, id) => row[id];

  eq(
    u.applyFilters(rows, { published: false }, get).map((r) => r.id),
    ['2'],
  );

  eq(
    u.applyFilters(rows, { at: { from: '2024-03-01', to: '' } }, get).map((r) => r.id),
    ['2', '3'],
  );

  eq(
    u.applyFilters(rows, { at: { from: '', to: '2024-01-31' } }, get).map((r) => r.id),
    ['1'],
  );

  eq(
    u.applyFilters(rows, { at: { from: '2024-02-01', to: '2024-05-31' } }, get).map((r) => r.id),
    ['2'],
  );
});

test('resolveDetailColumn precedence: explicit > code > id, false excludes', () => {
  // code-like wins over id-like
  const cols1 = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'orderCode', header: 'Code' },
  ];
  assert.strictEqual(u.resolveDetailColumn(cols1), 'orderCode');

  // explicit opt-in wins over both
  const cols2 = [
    { accessorKey: 'id', header: 'ID', enableDetailNavigation: true },
    { accessorKey: 'orderCode', header: 'Code' },
  ];
  assert.strictEqual(u.resolveDetailColumn(cols2), 'id');

  // enableDetailNavigation: false removes a candidate
  const cols3 = [
    { accessorKey: 'orderCode', header: 'Code', enableDetailNavigation: false },
    { accessorKey: 'sku', header: 'SKU' },
  ];
  assert.strictEqual(u.resolveDetailColumn(cols3), 'sku');

  // id-like fallback
  const cols4 = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'productId', header: 'Product' },
  ];
  assert.strictEqual(u.resolveDetailColumn(cols4), 'productId');

  // nothing suitable
  assert.strictEqual(u.resolveDetailColumn([{ accessorKey: 'name', header: 'Name' }]), null);
});

test('clampPage keeps pageIndex inside the valid range', () => {
  assert.strictEqual(u.clampPage(0, 10, 0), 0);
  assert.strictEqual(u.clampPage(5, 10, 0), 0);
  assert.strictEqual(u.clampPage(-1, 10, 57), 0);
  assert.strictEqual(u.clampPage(99, 10, 57), 5);
  assert.strictEqual(u.clampPage(3, 10, 57), 3);
});

test('formatRange renders the Vietnamese wording and is empty at 0 rows', () => {
  assert.strictEqual(u.formatRange(0, 10, 57), 'Hiển thị 1 - 10 trong 57 bản ghi');
  assert.strictEqual(u.formatRange(1, 10, 57), 'Hiển thị 11 - 20 trong 57 bản ghi');
  assert.strictEqual(u.formatRange(5, 10, 57), 'Hiển thị 51 - 57 trong 57 bản ghi');
  assert.strictEqual(u.formatRange(0, 10, 0), '');
  assert.strictEqual(u.formatRange(0, 10, 3, 'mục'), 'Hiển thị 1 - 3 trong 3 mục');
});

const filterDefs = [
  { id: 'status', label: 'Status', type: 'select', options: [] },
  { id: 'tags', label: 'Tags', type: 'multi-select', options: [] },
  { id: 'published', label: 'Published', type: 'boolean', options: [] },
  { id: 'range', label: 'Range', type: 'date-range', options: [] },
];

test('parse/serialize URL round-trips multi-select, boolean, date-range and sort', () => {
  const params = new URLSearchParams(
    'page=3&pageSize=20&search=ao&sort=price:desc&f_status=ACTIVE&f_tags=a,b&f_published=true&f_range=2024-01-01..2024-02-01',
  );
  const parsed = u.parseTableUrlParams(params, filterDefs);
  assert.strictEqual(parsed.page, 3);
  assert.strictEqual(parsed.pageSize, 20);
  assert.strictEqual(parsed.search, 'ao');
  eq(parsed.sort, { id: 'price', dir: 'desc' });
  assert.strictEqual(parsed.filters.status, 'ACTIVE');
  eq(parsed.filters.tags, ['a', 'b']);
  assert.strictEqual(parsed.filters.published, true);
  eq(parsed.filters.range, { from: '2024-01-01', to: '2024-02-01' });

  const serialized = u.serializeTableUrlParams(
    { page: parsed.page, pageSize: parsed.pageSize, search: parsed.search, sort: parsed.sort, filters: parsed.filters },
    filterDefs,
  );
  assert.strictEqual(serialized.page, '3');
  assert.strictEqual(serialized.pageSize, '20');
  assert.strictEqual(serialized.search, 'ao');
  assert.strictEqual(serialized.sort, 'price:desc');
  assert.strictEqual(serialized.f_status, 'ACTIVE');
  assert.strictEqual(serialized.f_tags, 'a,b');
  assert.strictEqual(serialized.f_published, 'true');
  assert.strictEqual(serialized.f_range, '2024-01-01..2024-02-01');
});

test('serialize omits defaults and inactive filters', () => {
  const serialized = u.serializeTableUrlParams(
    { page: 1, pageSize: u.DEFAULT_PAGE_SIZE, search: '', sort: null, filters: { status: null, tags: [], published: null, range: { from: '', to: '' } } },
    filterDefs,
  );
  eq(serialized, {});
});

test('parse tolerates missing/invalid params', () => {
  const parsed = u.parseTableUrlParams(new URLSearchParams(''), filterDefs);
  assert.strictEqual(parsed.page, 1);
  assert.strictEqual(parsed.pageSize, undefined);
  assert.strictEqual(parsed.search, undefined);
  assert.strictEqual(parsed.sort, null);
  eq(parsed.filters, {});

  const bad = u.parseTableUrlParams(new URLSearchParams('page=abc&sort=&f_published=maybe'), filterDefs);
  assert.strictEqual(bad.page, 1);
  assert.strictEqual(bad.sort, null);
  assert.strictEqual(bad.filters.published, null);
});

test('urlKeyPrefix namespaces every key', () => {
  const params = new URLSearchParams('t_page=2&t_search=hi&t_f_status=DRAFT');
  const parsed = u.parseTableUrlParams(params, filterDefs, { urlKeyPrefix: 't_' });
  assert.strictEqual(parsed.page, 2);
  assert.strictEqual(parsed.search, 'hi');
  assert.strictEqual(parsed.filters.status, 'DRAFT');

  const serialized = u.serializeTableUrlParams(
    { page: 2, pageSize: u.DEFAULT_PAGE_SIZE, search: 'hi', sort: null, filters: { status: 'DRAFT' } },
    filterDefs,
    { urlKeyPrefix: 't_' },
  );
  assert.strictEqual(serialized.t_page, '2');
  assert.strictEqual(serialized.t_search, 'hi');
  assert.strictEqual(serialized.t_f_status, 'DRAFT');
  assert.strictEqual(serialized.page, undefined);
});

function applyAll(updater, prev) {
  return typeof updater === 'function' ? updater(prev) : updater;
}

test('createTableChangeHandlers resets pageIndex on search/filter/sort/pageSize', () => {
  let pagination = { pageIndex: 4, pageSize: 10 };
  let sorting = [{ id: 'name', desc: false }];
  let search = '';
  let filters = {};

  const handlers = u.createTableChangeHandlers({
    setPagination: (updater) => { pagination = applyAll(updater, pagination); },
    setSorting: (updater) => { sorting = applyAll(updater, sorting); },
    setSearch: (value) => { search = value; },
    setFilters: (updater) => { filters = applyAll(updater, filters); },
  });

  // search change resets page
  handlers.onSearchChange('ao');
  assert.strictEqual(search, 'ao');
  assert.strictEqual(pagination.pageIndex, 0);

  pagination.pageIndex = 3;
  handlers.onFiltersChange({ status: 'ACTIVE' });
  eq(filters, { status: 'ACTIVE' });
  assert.strictEqual(pagination.pageIndex, 0);

  pagination.pageIndex = 2;
  handlers.onSortingChange([{ id: 'price', desc: true }]);
  eq(sorting, [{ id: 'price', desc: true }]);
  assert.strictEqual(pagination.pageIndex, 0);

  // pageSize change resets to page 0 with the new size
  pagination.pageIndex = 5;
  handlers.onPageSizeChange(50);
  eq(pagination, { pageIndex: 0, pageSize: 50 });

  // plain pagination change does NOT force a reset
  handlers.onPaginationChange((prev) => ({ ...prev, pageIndex: 2 }));
  assert.strictEqual(pagination.pageIndex, 2);
});

test('toTableSortState / toSortingState convert between single and array forms', () => {
  eq(u.toTableSortState([]), null);
  eq(u.toTableSortState([{ id: 'a', desc: false }]), { id: 'a', dir: 'asc' });
  eq(u.toTableSortState([{ id: 'a', desc: true }]), { id: 'a', dir: 'desc' });
  eq(u.toSortingState(null), []);
  eq(u.toSortingState({ id: 'a', dir: 'desc' }), [{ id: 'a', desc: true }]);
});

test('isFilterActive treats null/empty as inactive but boolean false as active', () => {
  assert.strictEqual(u.isFilterActive(null), false);
  assert.strictEqual(u.isFilterActive(''), false);
  assert.strictEqual(u.isFilterActive([]), false);
  assert.strictEqual(u.isFilterActive({ from: '', to: '' }), false);
  assert.strictEqual(u.isFilterActive(false), true);
  assert.strictEqual(u.isFilterActive('x'), true);
  assert.strictEqual(u.isFilterActive(['a']), true);
  assert.strictEqual(u.isFilterActive({ from: '2024-01-01', to: '' }), true);
});
