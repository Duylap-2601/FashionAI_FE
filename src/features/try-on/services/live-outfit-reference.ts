import type { LiveTryOnGarment } from '@/features/try-on/types/live-try-on';

export interface LiveOutfitReference {
  image: Blob;
  prompt: string;
}

export function buildOutfitPrompt(upper: LiveTryOnGarment, lower: LiveTryOnGarment) {
  return [
    'Dress the person in BOTH garments from the reference: upper garment on the left, trousers on the right. Preserve each garment color, pattern and fit. Keep face and body unchanged.',
    `Upper: ${upper.prompt.slice(0, 220)}`,
    `Lower: ${lower.prompt.slice(0, 220)}`,
  ].join(' ').slice(0, 700);
}

// Combine both garments into the single reference image accepted by the provider.
export async function prepareLiveOutfitReference(
  upper: LiveTryOnGarment,
  lower: LiveTryOnGarment,
  signal: AbortSignal,
): Promise<LiveOutfitReference> {
  if (upper.productId === lower.productId) {
    throw new Error('Bạn đang chọn cùng một món ở cả hai ô. Hãy chọn một áo và một quần khác nhau để thử cả bộ.');
  }
  if (upper.category !== 'UPPER') {
    throw new Error('Món ở ô Áo chưa phù hợp. Hãy chọn áo sơ mi, áo thun hoặc áo khoác để thử cùng quần.');
  }
  if (lower.category !== 'LOWER') {
    throw new Error('Món ở ô Quần chưa phù hợp. Hãy chọn quần hoặc chân váy để thử cùng áo.');
  }
  const blobs = await Promise.all([upper, lower].map(async (garment) => {
    const response = await fetch(garment.imageUrl, { signal, mode: 'cors' });
    if (!response.ok) throw new Error('Không tải được ảnh áo hoặc quần. Vui lòng chọn lại.');
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) throw new Error('Ảnh trang phục không hợp lệ.');
    return blob;
  }));
  const bitmaps: ImageBitmap[] = [];
  try {
    for (const blob of blobs) bitmaps.push(await createImageBitmap(blob));
    signal.throwIfAborted();
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Trình duyệt không hỗ trợ chuẩn bị ảnh cả bộ.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    bitmaps.forEach((bitmap, index) => {
      const scale = Math.min(464 / bitmap.width, 960 / bitmap.height);
      const width = bitmap.width * scale;
      const height = bitmap.height * scale;
      context.drawImage(bitmap, index * 512 + (512 - width) / 2, (1024 - height) / 2, width, height);
    });
    const image = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Không tạo được ảnh cả bộ.')), 'image/png');
    });
    signal.throwIfAborted();
    return { image, prompt: buildOutfitPrompt(upper, lower) };
  } finally {
    bitmaps.forEach((bitmap) => bitmap.close());
  }
}
