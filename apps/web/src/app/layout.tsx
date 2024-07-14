import "~/styles/globals.css";

import { Inter } from "next/font/google";

const interFont = Inter({ variable: "--font-inter" });

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={interFont.variable}>
      <body>{children}</body>
    </html>
  );
}
