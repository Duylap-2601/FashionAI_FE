const test = require('node:test');
const assert = require('node:assert');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { createSourceLoader } = require('./helpers/load-source.cjs');

function makeLoader({ search = '', pathname = '/' } = {}) {
  const noop = () => {};
  return createSourceLoader({
    mocks: {
      'next/link': {
        __esModule: true,
        default: (props) => React.createElement('a', { href: props.href, className: props.className }, props.children),
      },
      'next/navigation': {
        usePathname: () => pathname,
        useRouter: () => ({ replace: noop, push: noop }),
        useSearchParams: () => new URLSearchParams(search),
      },
    },
  });
}

const data = [
  { id: '1', code: 'SP001', name: 'Áo sơ mi', price: 120000, status: 'ACTIVE' },
  { id: '2', code: 'SP002', name: 'Quần jean', price: 250000, status: 'DRAFT' },
  { id: '3', code: 'SP003', name: 'Đầm dạ hội', price: 500000, status: 'ACTIVE' },
];

function baseColumns() {
  return [
    { accessorKey: 'code', header: 'Mã', sortFn: 'alphanumeric' },
    { accessorKey: 'name', header: 'Tên', sortFn: 'alphanumeric' },
    { accessorKey: 'price', header: 'Giá', sortFn: 'basic', format: 'number' },
    { accessorKey: 'status', header: 'Trạng thái' },
  ];
}

test('ClientTable renders headers, STT, and formatted cells', () => {
  const load = makeLoader();
  const { ClientTable } = load('@/components/tables/client-table');
  const html = renderToStaticMarkup(
    React.createElement(ClientTable, { data, columns: baseColumns() }),
  );

  assert.match(html, /Mã/);
  assert.match(html, /Tên/);
  assert.match(html, /Giá/);
  assert.match(html, /Trạng thái/);

  // STT 1..3 and the raw values
  assert.match(html, />1</);
  assert.match(html, />2</);
  assert.match(html, />3</);
  assert.match(html, /Áo sơ mi/);
  assert.match(html, /Đầm dạ hội/);
  // number format groups thousands (vi-VN)
  assert.match(html, /120\.000/);
  assert.match(html, /500\.000/);
});

test('ClientTable detail link renders an <a> for the resolved detail column only', () => {
  const load = makeLoader();
  const { ClientTable } = load('@/components/tables/client-table');
  const html = renderToStaticMarkup(
    React.createElement(ClientTable, {
      data,
      columns: baseColumns(),
      getDetailUrl: (row) => `/products/${row.id}`,
    }),
  );

  // code is code-like -> detail column; its cells become links
  assert.match(html, /<a[^>]+href="\/products\/1"/);
  assert.match(html, /<a[^>]+href="\/products\/3"/);
  // name is not the detail column -> not a link
  assert.doesNotMatch(html, /<a[^>]+href="\/products\/1"[^>]*>Quần/);
});

test('ClientTable custom cell wins over the detail link', () => {
  const load = makeLoader();
  const { ClientTable } = load('@/components/tables/client-table');
  const columns = baseColumns();
  columns[0] = { ...columns[0], cell: (info) => `CODE:${info.getValue()}` };
  const html = renderToStaticMarkup(
    React.createElement(ClientTable, {
      data,
      columns,
      getDetailUrl: (row) => `/products/${row.id}`,
    }),
  );

  // custom cell renders, no anchor wraps the code value
  assert.match(html, /CODE:SP001/);
  assert.doesNotMatch(html, /<a[^>]+href="\/products\/1"/);
});

test('ClientTable getDetailUrl returning null falls back to plain text', () => {
  const load = makeLoader();
  const { ClientTable } = load('@/components/tables/client-table');
  const html = renderToStaticMarkup(
    React.createElement(ClientTable, {
      data,
      columns: baseColumns(),
      getDetailUrl: () => null,
    }),
  );
  assert.doesNotMatch(html, /<a[^>]+href=/);
  assert.match(html, /SP001/);
});

test('ClientTable row actions render icon buttons with aria-labels', () => {
  const load = makeLoader();
  const { ClientTable } = load('@/components/tables/client-table');
  const actions = [
    { id: 'view', label: 'Xem', icon: React.createElement('svg'), onClick: () => {} },
    { id: 'edit', label: 'Sửa', icon: React.createElement('svg'), onClick: () => {} },
    { id: 'del', label: 'Xóa', icon: React.createElement('svg'), onClick: () => {}, destructive: true },
  ];
  const html = renderToStaticMarkup(
    React.createElement(ClientTable, { data, columns: baseColumns(), actions }),
  );
  assert.match(html, /aria-label="Xem"/);
  assert.match(html, /aria-label="Sửa"/);
  assert.match(html, /aria-label="Xóa"/);
  assert.match(html, /Thao tác/);
});

test('ClientTable empty (no-data) vs no-match variants', () => {
  const load = makeLoader();
  const { ClientTable } = load('@/components/tables/client-table');

  const emptyHtml = renderToStaticMarkup(
    React.createElement(ClientTable, { data: [], columns: baseColumns() }),
  );
  assert.match(emptyHtml, /data-variant="no-data"/);
  assert.match(emptyHtml, /Chưa có bản ghi nào/);

  // With syncUrl and a search that matches nothing -> no-match + Clear
  const urlLoader = makeLoader({ search: 'search=khong-ton-tai' });
  const { ClientTable: UrlTable } = urlLoader('@/components/tables/client-table');
  const noMatchHtml = renderToStaticMarkup(
    React.createElement(UrlTable, {
      data,
      columns: baseColumns(),
      syncUrl: true,
      filters: [],
    }),
  );
  assert.match(noMatchHtml, /data-variant="no-match"/);
  assert.match(noMatchHtml, /Không tìm thấy kết quả phù hợp/);
});

test('ClientTable hydrates search and sort from the URL when syncUrl', () => {
  const load = makeLoader({ search: 'search=dam&sort=price:desc' });
  const { ClientTable } = load('@/components/tables/client-table');
  const html = renderToStaticMarkup(
    React.createElement(ClientTable, {
      data,
      columns: baseColumns(),
      syncUrl: true,
      filters: [],
    }),
  );

  // search "dam" matches only "Đầm" (normalized); sorted by price desc; STT is 1
  assert.match(html, /Đầm dạ hội/);
  assert.doesNotMatch(html, /Áo sơ mi/);
  assert.doesNotMatch(html, /Quần jean/);
  assert.match(html, />1</);
});

test('ServerTable shows pagination from totalRows and hides it at zero', () => {
  const load = makeLoader();
  const { ServerTable } = load('@/components/tables/server-table');

  const html = renderToStaticMarkup(
    React.createElement(ServerTable, {
      data: data.slice(0, 2),
      columns: baseColumns(),
      totalRows: 57,
      pagination: { pageIndex: 1, pageSize: 10 },
      onPaginationChange: () => {},
    }),
  );
  assert.match(html, /Hiển thị 11 - 20 trong 57 bản ghi/);
  assert.match(html, /SP001/);

  const zeroHtml = renderToStaticMarkup(
    React.createElement(ServerTable, {
      data: [],
      columns: baseColumns(),
      totalRows: 0,
      pagination: { pageIndex: 0, pageSize: 10 },
      onPaginationChange: () => {},
    }),
  );
  // pagination control is hidden at zero rows (the "Hiển thị cột" column button is unrelated)
  assert.doesNotMatch(zeroHtml, /trong \d+ bản ghi/);
});

test('ServerTable renders skeleton while loading and error+Retry on failure', () => {
  const load = makeLoader();
  const { ServerTable } = load('@/components/tables/server-table');

  const loadingHtml = renderToStaticMarkup(
    React.createElement(ServerTable, {
      data: [],
      columns: baseColumns(),
      totalRows: 0,
      pagination: { pageIndex: 0, pageSize: 10 },
      onPaginationChange: () => {},
      loading: true,
    }),
  );
  assert.match(loadingHtml, /data-slot="table-container"/);

  const errorHtml = renderToStaticMarkup(
    React.createElement(ServerTable, {
      data: [],
      columns: baseColumns(),
      totalRows: 0,
      pagination: { pageIndex: 0, pageSize: 10 },
      onPaginationChange: () => {},
      error: 'Không tải được dữ liệu',
      onRetry: () => {},
    }),
  );
  assert.match(errorHtml, /data-slot="table-error"/);
  assert.match(errorHtml, /Không tải được dữ liệu/);
  assert.match(errorHtml, /Thử lại/);
});
