import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import "../styles/index.css";

export const metadata: Metadata = {
  title: "FashionAI — Thử Đồ Ảo AI",
  description: "Trải nghiệm thử đồ ảo AI thông minh cho trang phục công sở và thiết kế cá nhân",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FashionAI",
  },
};

export const viewport: Viewport = {
  themeColor: "#38140C",
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
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
