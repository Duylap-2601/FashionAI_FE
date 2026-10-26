import { Providers } from "@/components/providers/Providers";
import { buildGaBootstrapScript, GA_DEBUG, GA_MEASUREMENT_ID } from "@/lib/analytics";
import "@/styles/index.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import Script from "next/script";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StAie. — Chuẩn dáng từ đầu, đẹp từng đường may",
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
    <html lang="vi" className={playfair.variable}>
      <body className="antialiased" suppressHydrationWarning>
        {GA_MEASUREMENT_ID ? (
          // Phải chạy trước GoogleAnalytics để consent mặc định có hiệu lực từ hit đầu tiên.
          <Script
            id="ga-bootstrap"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: buildGaBootstrapScript(GA_MEASUREMENT_ID) }}
          />
        ) : null}
        <Providers>
          {children}
        </Providers>
      </body>
      {GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} debugMode={GA_DEBUG} /> : null}
    </html>
  );
}
