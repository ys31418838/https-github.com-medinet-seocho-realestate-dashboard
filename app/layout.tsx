import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "메디넷부동산 | 서초구 부동산 대시보드",
  description: "서초구 동별 아파트 실거래, TOP 10, 지도와 입지 분석을 한눈에 보는 메디넷부동산 브리핑 대시보드",
  icons: { icon: "/medinet-logo.png", shortcut: "/medinet-logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
