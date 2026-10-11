import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "HotelSaaS - Quản Lý Khách Sạn Đa Thuê Bao & AI PMS",
  description: "Hệ thống SaaS quản lý chuỗi khách sạn đa thuê bao với trợ lý AI Chatbot RAG",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
