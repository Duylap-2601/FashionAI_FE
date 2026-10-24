import type { ProductColor, ProductImageItem } from '@/features/admin/types/admin-dashboard-page';

/** Chuẩn hoá về #RRGGBB in hoa (#abc -> #AABBCC); giá trị không hợp lệ thành #000000. */
export function normalizeHex(hex?: string): string {
  if (!hex) return '#000000';
  let h = hex.trim();
  if (!h.startsWith('#')) h = '#' + h;
  if (/^#[0-9A-Fa-f]{3}$/.test(h)) {
    h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  return /^#[0-9A-Fa-f]{6}$/.test(h) ? h.toUpperCase() : '#000000';
}

/**
 * Danh sách màu gửi backend: bỏ màu chưa đặt tên, chuẩn hoá hex, và bổ sung màu đã gán cho ảnh
 * nhưng chưa có trong danh sách (backend từ chối ảnh mang màu lạ, và màu sẽ bị mất khi lưu).
 */
export function resolveProductColors(editingColors: ProductColor[] | undefined, images: ProductImageItem[]): ProductColor[] {
  const colors = (editingColors || [])
    .map(c => ({ name: c.name.trim(), hex: normalizeHex(c.hex) }))
    .filter(c => c.name.length > 0);

  images.forEach(img => {
    const name = img.colorName?.trim();
    if (!name) return;
    if (!colors.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      colors.push({ name, hex: name.toLowerCase().includes('đen') ? '#111111' : '#000000' });
    }
  });

  return colors;
}

/** Tên màu đúng chính tả trong `colors` cho màu đã gán của một ảnh, hoặc null. */
export function resolveImageColor(colors: ProductColor[], colorName?: string | null): string | null {
  if (!colorName) return null;
  const match = colors.find(c => c.name.toLowerCase() === colorName.trim().toLowerCase());
  return match ? match.name : null;
}

/** Form upload thêm ảnh cho sản phẩm đã có; gửi cả `images` lẫn `image` để tương thích backend cũ. */
export function buildProductImagesForm(files: File[], imageColors: (string | null)[]): FormData {
  const form = new FormData();
  files.forEach((file, index) => {
    form.append('images', file);
    if (index === 0) form.append('image', file);
  });
  form.append('isMainIndex', '0');
  form.append('isMain', 'true');
  form.append('imageColors', JSON.stringify(imageColors));
  return form;
}

/** Form upload một ảnh, dùng khi backend chỉ nhận một file mỗi request. */
export function buildSingleProductImageForm(file: File, imageColor: string | null): FormData {
  const form = new FormData();
  form.append('image', file);
  form.append('images', file);
  form.append('imageColors', JSON.stringify([imageColor]));
  return form;
}

export interface CreateProductFormInput {
  name: string;
  price: number;
  category: string;
  garmentType?: string | null;
  layerRole?: import('@/features/admin/types/admin-dashboard-page').LayerRole | null;
  status?: string;
  material?: string;
  description?: string;
  colors: ProductColor[];
  files: File[];
  imageColors: (string | null)[];
}

/** POST /products nhận multipart: thông tin sản phẩm cùng toàn bộ ảnh. */
export function buildCreateProductForm(input: CreateProductFormInput): FormData {
  const form = new FormData();
  form.append('name', input.name);
  form.append('price', String(input.price));
  form.append('category', input.category);
  form.append('status', input.status || 'ACTIVE');
  if (input.garmentType) form.append('garmentType', input.garmentType);
  if (input.layerRole) form.append('layerRole', input.layerRole);
  if (input.material) form.append('material', input.material);
  if (input.description) form.append('description', input.description);
  const primaryColor = input.colors[0]?.name;
  if (primaryColor) form.append('color', primaryColor);
  if (input.colors.length > 0) form.append('colors', JSON.stringify(input.colors));

  if (input.files.length > 0) {
    input.files.forEach(file => form.append('images', file));
    // Thêm field 'image' của ảnh đầu tiên để tương thích backend cũ
    form.append('image', input.files[0]);
    form.append('imageColors', JSON.stringify(input.imageColors));
  }
  return form;
}
