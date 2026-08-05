import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career Copilot",
  description: "RAG + Agentic Resume-to-Interview Pipeline",
};

import { Header } from "@/components/shared/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} antialiased`}>
      <body className="min-h-screen bg-slate-900 text-slate-50 flex flex-col font-sans">
        <Header />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
