import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import StyledComponentsRegistry from "@/lib/regstry";

const noto = Noto_Sans_KR({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "이제이엠컴퍼니 과제",
  description:
    "React를 사용해 네이버 지도를 호출하고 API를 호출해 마커 표시하기",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={noto.className}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        <Script
          src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_MAP_KEY}`}
          strategy="beforeInteractive"
        ></Script>
      </body>
    </html>
  );
}
