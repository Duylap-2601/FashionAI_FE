const assert = require('node:assert/strict');
const test = require('node:test');
const { renderLiveWorkspace } = require('./helpers/render-live-workspace.cjs');

function button(html, label) {
  return [...html.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)].map(([value]) => value).find((value) => value.includes(label));
}

test('paused outfit keeps the session timer and allows resume even when daily free balance is zero', () => {
  const html = renderLiveWorkspace({ status: 'paused', combo: true, dailyRemaining: 0 });
  assert.match(html, /Phiên còn 00:42/);
  assert.match(html, /Đã tạm dừng/);
  assert.ok(!button(html, 'Tiếp tục Live').includes(' disabled='));
  assert.ok(!button(html, 'Đổi áo:').includes(' disabled='));
  assert.ok(!button(html, 'Đổi quần:').includes(' disabled='));
  assert.ok(button(html, 'Kết thúc'));
  assert.doesNotMatch(html, /thử nghiệm|SDK|lease|Decart state/);
});

test('active session prominently offers pause and locks outfit selection', () => {
  const html = renderLiveWorkspace({ status: 'live', combo: true, remaining: 8 });
  assert.match(html, /Phiên còn 00:08/);
  assert.match(html, /Sắp hết thời gian/);
  assert.ok(!button(html, 'Tạm dừng').includes(' disabled='));
  assert.ok(button(html, 'Đổi áo:').includes(' disabled='));
  assert.ok(button(html, 'Kết thúc'));
});

test('restored paused session uses server time and offers end and resume', () => {
  const paused = renderLiveWorkspace({ status: 'idle', serverStatus: 'PAUSED', localSession: false, remaining: 23 });
  assert.match(paused, /Phiên còn 00:23/);
  assert.ok(!button(paused, 'Tiếp tục Live').includes(' disabled='));
  assert.ok(!button(paused, 'Kết thúc').includes(' disabled='));
});

test('transition locks repeated actions and shows pending status', () => {
  const html = renderLiveWorkspace({ status: 'pausing' });
  assert.match(html, /Đang tạm dừng/);
  assert.ok(button(html, 'Vui lòng chờ').includes(' disabled='));
  assert.ok(button(html, 'Kết thúc').includes(' disabled='));
});
