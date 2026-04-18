import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "no days off",
  description:
    "running everyday from July 11, 2015 to February 23, 2026 — a continuous running streak.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jost.variable} h-full`}>
      <body className="min-h-full antialiased font-sans bg-[#0a0a0a] text-[#ededed]">
        {children}
      </body>
    </html>
  );
}
