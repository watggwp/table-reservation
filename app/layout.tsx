import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["thai", "latin"]
});

export const metadata: Metadata = {
  title: "ระบบจองโต๊ะงานอีเว้นท์",
  description: "ระบบจองโต๊ะพร้อมเลือกโต๊ะเองแบบเรียลไทม์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.className} antialiased bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
