export function fmt(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

// API timestamps are UTC ISO strings; slicing them shows UTC, so format in local time
// as "HH:mm dd/MM/yyyy" (built by hand: vi-VN joins day-month with "-" when the year is left out).
export function fmtDateTime(iso?: string | null, options: { withYear?: boolean; withTime?: boolean } = {}) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const { withYear = true, withTime = true } = options;
  const pad = (value: number) => String(value).padStart(2, '0');
  const day = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}${withYear ? `/${date.getFullYear()}` : ''}`;
  return withTime ? `${pad(date.getHours())}:${pad(date.getMinutes())} ${day}` : day;
}
