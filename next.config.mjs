import withPWA from '@ducanh2912/next-pwa';

// Backend được proxy qua chính origin của FE (xem rewrites bên dưới). Nhờ vậy cookie
// refresh_token backend set trở thành first-party, browser mới chịu gửi lại nó trong
// request fetch/XHR — cookie SameSite=Lax không bao giờ đi kèm request cross-site.
const BACKEND_ORIGIN = (process.env.BACKEND_ORIGIN ?? 'http://localhost:3002').replace(/\/+$/, '');

// Không dùng thẳng /api/:path* : rewrite dạng array chạy ở giai đoạn afterFiles,
// tức là TRƯỚC dynamic route, nên sẽ ăn luôn app/api/auth/[...nextauth]/route.ts
// của NextAuth. Prefix riêng vẫn nằm dưới /api để khớp REFRESH_COOKIE_PATH=/api.
const BACKEND_PROXY_PREFIX = '/api/backend';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'fal.storage' },
      { protocol: 'https', hostname: 'fal.media' }
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: `${BACKEND_PROXY_PREFIX}/:path*`,
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

const isDev = process.env.NODE_ENV === 'development';

export default (isDev ? nextConfig : withPWA({
  dest: 'public',
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // Rule "apis" mặc định của next-pwa NetworkFirst mọi GET same-origin dưới
        // /api/. Sau khi proxy, response có token/dữ liệu riêng của user sẽ bị
        // service worker cache 24h và trả lại cho lần mở sau (kể cả khi đã 401).
        // Chuỗi phải viết literal: workbox serialize hàm này bằng toString() rồi
        // nhét vào sw.js, biến ngoài closure (BACKEND_PROXY_PREFIX) sẽ undefined.
        urlPattern: ({ sameOrigin, url }) =>
          sameOrigin && url.pathname.startsWith('/api/backend/'),
        handler: 'NetworkOnly',
      },
    ],
  },
})(nextConfig));
