import { Providers } from "@/components/providers/Providers";
import "@/styles/index.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "StAle. FashionAI — Chuẩn dáng từ đầu, đẹp từng đường may",
  description: "Thời trang công sở may đo cao cấp kết hợp công nghệ thử đồ ảo AI thông minh — Chuẩn dáng từ đầu, đẹp từng đường may",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FashionAI",
  },
};

export const viewport: Viewport = {
  themeColor: "#5D1C34",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
