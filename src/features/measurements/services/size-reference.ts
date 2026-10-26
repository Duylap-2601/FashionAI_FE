import { SHIRT_SIZE_GUIDE, SHIRT_SIZES } from '@/features/measurements/constants/profile-measurements-page';

type SizeMeasureKey = 'chest' | 'waist' | 'hip';

const SIZE_MEASURE_KEYS: SizeMeasureKey[] = ['chest', 'waist', 'hip'];

function parseRange(range: string): [number, number] | null {
  const [min, max] = range.split(/[–-]/).map((part) => Number(part.trim()));
  return Number.isFinite(min) && Number.isFinite(max) ? [min, max] : null;
}

/**
 * Cỡ áo tham khảo gần nhất với vòng ngực, eo, hông đã lưu: tổng khoảng cách tới khoảng của từng cỡ
 * (0 khi nằm trong khoảng). Trả về null khi chưa có số nào trong ba số đo này.
 */
export function findClosestShirtSize(measurements: Partial<Record<SizeMeasureKey, number | string | null | undefined>>) {
  // Backend trả Decimal nên giá trị có thể là chuỗi.
  const known = SIZE_MEASURE_KEYS.filter((key) => Number(measurements[key]) > 0);
  if (known.length === 0) return null;

  let best: { size: string; distance: number } | null = null;
  for (const size of SHIRT_SIZES) {
    const guide = SHIRT_SIZE_GUIDE[size];
    if (!guide) continue;
    let distance = 0;
    for (const key of known) {
      const range = parseRange(guide[key]);
      const value = Number(measurements[key]);
      if (!range) continue;
      if (value < range[0]) distance += range[0] - value;
      else if (value > range[1]) distance += value - range[1];
    }
    if (!best || distance < best.distance) best = { size, distance };
  }
  return best ? { size: best.size, basedOn: known, exact: best.distance === 0 } : null;
}
