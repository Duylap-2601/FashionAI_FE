# Kế hoạch chỉnh sửa Frontend — 3 nhóm thay đổi Backend

**Ngày**: 2026-08-26
**Phạm vi**: Phase 1 (gói trả tiền & quota), Phase 2 (đặt may theo số đo), Phase 3 (thử nhiều món cùng lúc)
**Không nằm trong tài liệu này**: realtime Socket.IO — xem `FE_REALTIME_INTEGRATION.md`

---

## 0. Tổng quan & thứ tự ưu tiên

| # | Nhóm thay đổi | Mức độ | Ảnh hưởng FE |
|---|---------------|--------|--------------|
| 1 | **Gói trả tiền & quota try-on** | 🔴 Breaking | User FREE không còn dùng được try-on; cần trang nâng cấp gói |
| 2 | **Đặt may theo số đo (bỏ size S/M/L)** | 🔴 Breaking | Bỏ toàn bộ UI chọn size; bắt buộc nhập số đo trước khi đặt hàng |
| 3 | **Thử nhiều món (áo + quần)** | 🟡 Tương thích ngược | Request cũ vẫn chạy; muốn thử combo thì đổi sang shape mảng |

**Thứ tự làm gợi ý**: 2 → 1 → 3.
Nhóm 2 phá vỡ nhiều màn hình nhất (product detail, cart, checkout) nên làm trước.
Nhóm 3 tương thích ngược nên có thể làm sau cùng mà không sợ vỡ app.

⚠️ **Điều kiện triển khai**: Backend phải chạy migration DB trước khi FE lên prod. Các cột `size`/`sizes` sẽ bị **xóa khỏi DB**, nên FE còn gửi `size` sẽ bị lỗi validation.

---

## 1. Phase 1 — Gói trả tiền & quota try-on

### 1.1 Hạn mức mới

| Tính năng | FREE | MEMBER | VIP |
|-----------|------|--------|-----|
| **Try-on (thử đồ)** | **0 (bị cấm)** | **5 / ngày** | **10 / ngày** |
| Stylist | 3 / ngày | (không đổi) | (không đổi) |
| Chatbot | 50 / ngày | 200 / ngày | ∞ |

Trước đây try-on là FREE 3 / MEMBER 10 / VIP ∞. Giờ **FREE bị cấm hoàn toàn**, và **VIP có giới hạn 10**.

### 1.2 Hai loại lỗi khác nhau — phải xử lý khác nhau

**a) `SUBSCRIPTION_REQUIRED` — HTTP 402**
User FREE bấm try-on, hoặc gói đã hết hạn. Đây **không phải** hết lượt, mà là chưa có quyền.

```json
{
  "success": false,
  "code": "SUBSCRIPTION_REQUIRED",
  "message": "Tính năng \"Thử đồ AI\" yêu cầu gói trả tiền. Vui lòng nâng cấp tài khoản!",
  "details": {
    "action": "TRY_ON",
    "tier": "FREE",
    "reason": "free_not_allowed"
  }
}
```

`details.reason` có 2 giá trị, UI nên nói khác nhau:
- `free_not_allowed` → "Nâng cấp để dùng thử đồ AI"
- `subscription_expired` → "Gói của bạn đã hết hạn, gia hạn để tiếp tục"

**b) `QUOTA_EXCEEDED` — HTTP 429**
Đã có gói nhưng hết lượt hôm nay.

```json
{
  "success": false,
  "code": "QUOTA_EXCEEDED",
  "message": "Bạn đã dùng 5/5 lượt Thử đồ AI hôm nay của gói MEMBER. Hãy nâng cấp tài khoản để có thêm lượt!",
  "details": {
    "action": "TRY_ON",
    "used": 5,
    "limit": 5,
    "requested": 1,
    "remaining": 0,
    "resetAt": "2026-08-26T23:59:59.999Z",
    "tier": "MEMBER"
  }
}
```

`details.requested` là **mới** (phục vụ combo ở Phase 3): số lượt request này cần.
Nếu `requested > remaining`, message sẽ có thêm câu *"Yêu cầu này cần 2 lượt nhưng chỉ còn 1 lượt."*

UI nên dùng `resetAt` để hiện "Lượt mới sau: HH:mm" thay vì nói chung chung.

### 1.3 Mua / gia hạn gói

Dùng chung endpoint checkout với đơn sản phẩm, phân biệt bằng field truyền lên:

```
POST /api/payments/checkout
Authorization: Bearer <access_token>
```

| Mục đích | Body |
|----------|------|
| Thanh toán đơn sản phẩm | `{ "orderId": "<uuid>" }` |
| **Nâng cấp / gia hạn gói** | `{ "targetTier": "MEMBER" }` hoặc `{ "targetTier": "VIP" }` |

Khi truyền `targetTier`, backend **tự tạo Order** cho gói đó — FE không cần gọi `POST /api/orders` trước.

Giá và thời hạn:

| Gói | Giá | Thời hạn |
|-----|-----|----------|
| MEMBER | 99.000đ | 30 ngày |
| VIP | 299.000đ | 30 ngày |

Response checkout trả thêm 2 field để FE biết đang thanh toán loại nào:
```json
{ "kind": "SUBSCRIPTION", "targetTier": "VIP", "checkoutUrl": "https://..." }
```
`kind` là `"SUBSCRIPTION"` hoặc `"PRODUCT"`.

**Gia hạn cộng dồn**: mua tiếp cùng gói khi chưa hết hạn thì 30 ngày mới **nối vào sau** ngày hết hạn cũ, không ghi đè.

### 1.4 Field mới trên user

`GET /api/users/me` (và JWT payload) giờ có thêm `tierExpiresAt`:

```typescript
{
  tier: 'FREE' | 'MEMBER' | 'VIP',
  tierExpiresAt: string | null,  // ISO date, null nếu FREE
}
```

FE nên hiện "Gói VIP · còn 12 ngày" và cảnh báo khi < 3 ngày.

⚠️ Gói hết hạn được backend tự hạ về FREE (job định kỳ). Nhưng ngay cả khi job chưa chạy, mọi API vẫn tự coi user là FREE nếu `tierExpiresAt` đã qua — nên FE **không được** tin `tier` một mình, phải đối chiếu `tierExpiresAt`.

---

## 2. Phase 2 — Đặt may theo số đo (bỏ size S/M/L)

Sản phẩm giờ là **đặt may theo số đo (made-to-measure)**. Khái niệm size chữ bị bỏ hoàn toàn.

### 2.1 Field bị XÓA — phải bỏ khỏi FE

| Nơi | Field bị xóa | Ghi chú |
|-----|--------------|---------|
| `POST/PATCH /api/products` | `size`, `sizes` | Gửi lên sẽ bị **400** (validation `forbidNonWhitelisted`) |
| `GET /api/products?...` | `size` (query filter) | Bỏ filter/dropdown chọn size |
| Response product | `size`, `sizes` | Không còn trong payload |
| `POST /api/orders` → `items[]` | `size` | Gửi lên sẽ bị **400** |
| Response stylist | `recommendedSize` | **Đổi tên** → `fitAdvice` |

`colors` (mảng `{ name, hex }`) vẫn giữ nguyên — chỉ size bị bỏ, màu thì không.

### 2.2 Field ĐỔI TÊN: `recommendedSize` → `fitAdvice`

Không chỉ đổi tên mà đổi cả **ý nghĩa và độ dài**:

```diff
- "recommendedSize": "L"
+ "fitAdvice": "Nên may ôm nhẹ ở eo, chừa rộng phần vai để thoải mái"
```

Trước là 1 chữ cái → render trong badge nhỏ được. Giờ là **câu văn dài** → UI phải đổi sang dạng đoạn text, không dùng chip/badge nữa.

### 2.3 Bắt buộc có số đo mới được đặt hàng

`POST /api/orders` giờ **chặn** nếu user thiếu số đo bắt buộc của loại trang phục đang mua:

```json
{
  "code": "MEASUREMENTS_INCOMPLETE",
  "missingFields": ["chest", "shoulder"],
  "missing": [
    { "field": "chest", "label": "Vòng ngực" },
    { "field": "shoulder", "label": "Vai" }
  ]
}
```

`missing[].label` là nhãn tiếng Việt sẵn dùng — FE hiện trực tiếp, không cần tự map.

### 2.4 Endpoint MỚI: kiểm tra số đo trước khi vào checkout

Để không đẩy user tới bước cuối mới báo lỗi, gọi trước:

```
GET /api/users/me/measurements/completeness
Authorization: Bearer <access_token>
```

```json
{
  "canOrder": false,
  "hasMeasurement": true,
  "byCategory": [
    {
      "category": "UPPER",
      "complete": true,
      "requiredFields": ["height", "chest", "shoulder", "sleeveLength", "shirtLength"],
      "missingFields": [],
      "missing": []
    },
    {
      "category": "LOWER",
      "complete": false,
      "requiredFields": ["height", "waist", "hip", "outseam", "thigh"],
      "missingFields": ["thigh"],
      "missing": [{ "field": "thigh", "label": "Vòng đùi" }]
    }
  ]
}
```

**Cách dùng gợi ý**:
- Product detail: nếu category của sản phẩm `complete: false` → hiện banner "Cần bổ sung số đo" + link tới form số đo
- Nút "Đặt hàng": disable kèm tooltip khi thiếu, thay vì để user bấm rồi ăn 400
- `canOrder` = đủ số đo cho **mọi** category (dùng cho giỏ hàng nhiều loại sản phẩm)

Số đo bắt buộc theo từng loại:

| Category | Số đo bắt buộc |
|----------|----------------|
| `UPPER` (áo) | height, chest, shoulder, sleeveLength, shirtLength |
| `LOWER` (quần/váy) | height, waist, hip, outseam, thigh |
| `FULL_BODY` (liền thân) | height, chest, waist, hip, shoulder, shirtLength |

Các số đo khác (neck, wrist, knee, calf, inseam, underbust, weight) là **tùy chọn** — form vẫn nên cho nhập nhưng không chặn.

### 2.5 Snapshot số đo trong đơn hàng

Khi đặt hàng, backend **chụp lại số đo tại thời điểm đó** vào `orderItem.measurementSnapshot`. User sửa số đo sau không ảnh hưởng đơn cũ. FE nên hiện snapshot này ở trang chi tiết đơn để user đối chiếu.

---

## 3. Phase 3 — Thử nhiều món cùng lúc (áo + quần)

### 3.1 Request cũ vẫn chạy

Endpoint không đổi: `POST /api/try-on` (multipart/form-data). Shape cũ vẫn được hỗ trợ:

```
humanImage: <file>
garmentImage: <file>          # hoặc productId
garmentCategory: UPPER
```

→ **FE không phải sửa gì nếu chưa cần combo.** Chỉ đổi khi muốn cho user thử áo + quần cùng lúc.

### 3.2 Shape mới: mảng `garments[]`

Dùng bracket-notation trong multipart, index bắt đầu từ 0:

```
humanImage:                 <file>
garments[0][image]:         <file>      # HOẶC garments[0][productId]
garments[0][category]:      UPPER
garments[1][image]:         <file>      # HOẶC garments[1][productId]
garments[1][category]:      LOWER
```

Ví dụ với `FormData`:

```typescript
const fd = new FormData();
fd.append('humanImage', humanFile);

// Món 1: áo — upload ảnh
fd.append('garments[0][image]', topFile);
fd.append('garments[0][category]', 'UPPER');

// Món 2: quần — lấy từ catalog
fd.append('garments[1][productId]', 'product-uuid');
fd.append('garments[1][category]', 'LOWER');

await fetch('/api/try-on', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },  // KHÔNG set Content-Type
  body: fd,
});
```

⚠️ Đừng tự set `Content-Type` — để browser tự sinh `boundary`.

### 3.3 Luật hợp lệ — nên validate ở FE trước khi gửi

| Luật | Lỗi trả về (400) |
|------|------------------|
| Tối đa **2 món** mỗi lần | `Tối đa 2 trang phục mỗi lần. Bạn truyền 3.` |
| Không trùng category | `Không thể chọn nhiều trang phục cùng phân loại` |
| `FULL_BODY` phải đứng **một mình** | `FULL_BODY (toàn thân) chỉ có thể đứng riêng, không kết hợp với trang phục khác` |
| Mỗi món: `image` **hoặc** `productId`, không cả 2 | `Trang phục 1: chỉ chọn 1 trong image hoặc productId, không cả 2` |
| Mỗi món phải có ít nhất 1 trong 2 | `Trang phục 1: phải truyền hoặc image hoặc productId` |

Tóm lại chỉ có 3 tổ hợp hợp lệ:
1. 1 món `UPPER` (thử áo)
2. 1 món `LOWER` (thử quần/váy)
3. `UPPER` + `LOWER` (thử cả bộ)
4. 1 món `FULL_BODY` (váy liền / jumpsuit) — không ghép được với gì

UI nên khóa sẵn: chọn `FULL_BODY` thì disable ô món thứ 2; đã chọn `UPPER` thì ô 2 chỉ còn `LOWER`.

### 3.4 Quota tính theo SỐ MÓN

**Quan trọng**: thử combo 2 món = **trừ 2 lượt**, không phải 1.

MEMBER có 5 lượt/ngày → chỉ thử được 2 combo + 1 món lẻ. FE nên nói rõ trước khi user bấm, ví dụ: *"Thử cả bộ sẽ dùng 2/5 lượt còn lại của bạn"*.

Nếu không đủ lượt, backend trả 429 với `details.requested = 2` và `details.remaining = 1` (xem mục 1.2).

### 3.5 Response có thêm field `garments`

```json
{
  "id": "uuid",
  "resultUrl": "https://cdn.../result.png",
  "category": "LOWER",
  "garments": [
    { "category": "UPPER", "productId": null },
    { "category": "LOWER", "productId": "product-uuid" }
  ],
  "isCached": false,
  "cacheKey": "...",
  "expiresAt": "2026-09-25T...",
  "createdAt": "2026-08-26T..."
}
```

- `garments` là **mới**, chỉ có khi response từ shape mảng; request cũ có thể không có field này → FE phải xử lý `undefined`.
- `category` (số ít, field cũ) với combo sẽ là category của **món cuối trong chuỗi** (thường là `LOWER`). Đừng dùng field này để hiện "user đã thử gì" nữa — dùng `garments` thay thế.
- `resultUrl` luôn là **1 ảnh duy nhất** đã ghép cả áo và quần, không phải mảng ảnh.

### 3.6 Lưu ý về thời gian chờ

Combo 2 món được xử lý **tuần tự** (mặc áo trước, rồi mặc quần lên kết quả đó), nên thời gian ≈ **gấp đôi** thử 1 món. FE nên:
- Hiện progress dạng 2 bước ("Đang mặc áo…" → "Đang mặc quần…") hoặc ít nhất tăng timeout
- Không để user bấm gửi lần 2 khi đang chạy — backend có lock, request trùng sẽ bị **429**

---

## 4. Bảng tổng hợp breaking changes

| API | Thay đổi | Hành động FE |
|-----|----------|--------------|
| `POST /api/try-on` | FREE bị cấm (402) | Chặn ở UI, hiện CTA nâng cấp |
| `POST /api/try-on` | VIP giờ giới hạn 10/ngày | Bỏ chữ "không giới hạn" trong UI VIP |
| `POST /api/try-on` | Combo trừ nhiều lượt | Hiện số lượt sẽ dùng trước khi gửi |
| `POST /api/products` | Bỏ `size`, `sizes` | Xóa khỏi form admin |
| `GET /api/products` | Bỏ query `size` | Xóa filter size |
| `POST /api/orders` | Bỏ `items[].size` | Xóa UI chọn size |
| `POST /api/orders` | Chặn nếu thiếu số đo | Gọi `completeness` trước, hiện form số đo |
| Stylist response | `recommendedSize` → `fitAdvice` | Đổi tên + đổi UI badge → đoạn text |
| `GET /api/users/me` | Thêm `tierExpiresAt` | Hiện ngày hết hạn gói |

## 5. Checklist theo màn hình

**Trang sản phẩm**
- [ ] Xóa UI chọn size (dropdown / chip S-M-L)
- [ ] Thêm banner "cần bổ sung số đo" dựa trên `completeness`
- [ ] Nút try-on: disable + CTA nâng cấp nếu tier FREE

**Giỏ hàng / Checkout**
- [ ] Bỏ `size` khỏi payload `POST /api/orders`
- [ ] Chặn checkout khi `canOrder = false`, dẫn tới form số đo
- [ ] Bắt lỗi `MEASUREMENTS_INCOMPLETE`, hiện danh sách `missing[].label`

**Form số đo**
- [ ] Đánh dấu rõ số đo bắt buộc vs tùy chọn (theo bảng 2.4)
- [ ] Sau khi lưu, refetch `completeness`

**Trang thử đồ (try-on)**
- [ ] Chuyển sang shape `garments[]`
- [ ] UI chọn 1 hoặc 2 món, khóa theo luật ở 3.3
- [ ] Hiện số lượt sẽ bị trừ
- [ ] Bắt 402 (nâng cấp) và 429 (hết lượt / trùng request) riêng biệt
- [ ] Hiện lịch sử dùng `garments` thay vì `category`

**Trang gói / Nâng cấp**
- [ ] Bảng giá MEMBER 99k / VIP 299k, 30 ngày
- [ ] `POST /api/payments/checkout` với `targetTier`
- [ ] Hiện `tierExpiresAt` + cảnh báo sắp hết hạn
- [ ] Ghi rõ hạn mức: MEMBER 5 lượt/ngày, VIP 10 lượt/ngày

**Stylist**
- [ ] Đổi `recommendedSize` → `fitAdvice`, render dạng đoạn text

## 6. Tổng hợp error code

| Code | HTTP | Ý nghĩa | UI |
|------|------|---------|-----|
| `SUBSCRIPTION_REQUIRED` | 402 | Chưa có gói / gói hết hạn | Modal nâng cấp |
| `QUOTA_EXCEEDED` | 429 | Hết lượt hôm nay | Hiện `resetAt` + CTA nâng cấp |
| `MEASUREMENTS_INCOMPLETE` | 400 | Thiếu số đo bắt buộc | Dẫn tới form số đo |
| (message tiếng Việt) | 400 | Sai luật garments | Hiện message trực tiếp |
| (duplicate) | 429 | Request try-on trùng đang chạy | "Đang xử lý, vui lòng đợi" |

---

**Câu hỏi / thắc mắc**: liên hệ backend team. Swagger đã cập nhật đầy đủ shape mới tại `/api/docs`.
