import type { Metadata } from "next";
import { Marmelad, Geist_Mono } from "next/font/google";
import "./globals.css";

const marmelad = Marmelad({
  variable: "--font-marmelad",
  subsets: ["latin", "cyrillic"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FOMO Fighters Wiki — Buildings, Troops & Skills",
  description:
    "The official FOMO Fighters game wiki. Browse buildings, troops, skills, progression tables and strategy guides.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${marmelad.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
