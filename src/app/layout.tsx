import type { Metadata } from "next";
import { Funnel_Display, Open_Sans } from "next/font/google";
import "./globals.css";
import "./public-site.css";

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const funnelDisplay = Funnel_Display({
  variable: "--font-public",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SVU Booking — Swinburne's Virtual Universe",
  description:
    "Book and manage sessions at Swinburne's Virtual Universe — a 100m² curved LED wall immersive facility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${openSans.variable} ${funnelDisplay.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
