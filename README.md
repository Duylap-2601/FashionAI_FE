# FashionAI Frontend

Ứng dụng Next.js 15 App Router cho mua sắm, may đo và thử đồ AI. Source được tổ chức
theo nghiệp vụ trong `src/features`; routing nằm trong `src/app`.

## Chạy dự án

```bash
npm ci
npm run dev
```

Mở [localhost:3001](http://localhost:3001). Dùng `npm.cmd` trên PowerShell nếu hệ thống
chặn thực thi file `.ps1`.

Backend mặc định ở `http://localhost:3002`. Next.js proxy request qua
`/api/backend` để giữ refresh cookie cùng origin. Các biến môi trường đang dùng:

| Biến | Mục đích |
| --- | --- |
| `BACKEND_ORIGIN` | Origin backend cho proxy và Google OAuth route handlers |
| `NEXT_PUBLIC_API_URL` | API base URL; mặc định `/api/backend` |
| `NEXT_PUBLIC_WS_URL` | Origin Socket.IO; không chứa hậu tố `/api` |

## Cấu trúc và quyền sở hữu

```text
src/
├── app/          # Page wrappers, layouts, metadata, API routes
├── features/     # UI, hooks, services, types, state theo nghiệp vụ
├── components/   # UI dùng chung, layout, providers, PWA
├── hooks/        # Hooks không thuộc feature
├── lib/          # HTTP client, realtime, platform, utilities
├── styles/
└── middleware.ts
```

Alias `@/` trỏ vào `src/`. Mỗi feature dùng `components/` cho cả component cấp trang
và component con; không có `screen/`. Chỉ tạo thư mục có nội dung.

| Feature | Màn hình / chức năng |
| --- | --- |
| `home` | Landing page |
| `auth` | Đăng nhập, đăng ký, quên/đổi/reset mật khẩu, xác thực email, OAuth web/mobile, session |
| `products`, `collections` | Danh sách/chi tiết sản phẩm, tìm kiếm, bộ sưu tập và quản trị bộ sưu tập |
| `cart`, `checkout` | Giỏ hàng, địa chỉ giao hàng, phương thức thanh toán, tạo đơn |
| `orders`, `payments` | Danh sách/chi tiết đơn, đặt hàng thành công, kết quả thanh toán |
| `profile`, `measurements` | Tài khoản, hồ sơ và số đo |
| `subscription` | Gói đăng ký, gia hạn, lịch sử và quota AI |
| `try-on`, `stylist`, `rack` | Thử đồ, tư vấn, lịch sử AI và giá treo |
| `chat`, `notifications`, `reviews` | Chat, thông báo, đánh giá và quản trị đánh giá |
| `admin` | Dashboard, sản phẩm, người dùng, đơn hàng và quota |

Các trang lịch sử dưới URL `/profile` vẫn thuộc feature nghiệp vụ tương ứng.
Route groups và URL giữ nguyên. Màn hình offline thuộc shared PWA.

HTTP GET nằm trong `services/queries.ts`, thao tác ghi trong `services/mutations.ts`.
Hooks giữ state, cache invalidation và side effects UI. Login/refresh dùng raw fetch
độc lập với Axios interceptor; đổi mật khẩu có xác thực dùng `password-mutations.ts`.
Query key factories giữ nguyên cache prefixes và thứ tự tham số.

Xem [AGENTS.md](AGENTS.md) để biết quy ước import, Server/Client, types và workflow.

## Kiểm tra source

```bash
npm run check:architecture
npm test
npm run typecheck
npm run lint
```

- Architecture check chỉ đọc source: import hợp lệ, route wrapper, HTTP trong
  services, shared dependencies và runtime cycles.
- Regression tests chạy bằng Node test runner, không cần build: refresh token,
  API mapping/payload, query keys và fallback collection.
- NextAuth legacy đã được loại bỏ. Auth hiện tại dùng Zustand và backend session.
  Typecheck và lint phải không có lỗi; không dùng cấu hình bỏ qua lỗi khi build.
- Các kiểm tra source và production build không thay thế kiểm thử tích hợp OAuth,
  thanh toán, socket, giao diện desktop/mobile hoặc PWA offline.

Bỏ qua `.next/`, `node_modules/`, `out/` và các thư mục sinh tự động khi refactor.
Để kiểm tra production, chạy `npm run build` rồi `npm start`; lưu ý PWA
có thể sinh lại `public/sw.js` và các Workbox assets.
