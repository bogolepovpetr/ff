import type { Metadata } from "next";
import { Marmelad, Philosopher, Geist_Mono } from "next/font/google";
import { rootMetadataTitle, SITE_METADATA_DESCRIPTION } from "@/lib/site-brand";
import "./globals.css";

const marmelad = Marmelad({
  variable: "--font-marmelad",
  subsets: ["latin", "cyrillic"],
  weight: "400",
});

const philosopher = Philosopher({
  variable: "--font-philosopher",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: rootMetadataTitle(),
  description: SITE_METADATA_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${marmelad.variable} ${philosopher.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
