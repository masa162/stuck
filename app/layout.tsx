import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "stuck - AI Knowledge Hub",
  description: "AIとのチャット履歴、壁打ち内容、収集した情報の整理・閲覧・編集",
  icons: {
    icon: "/images/fav.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
