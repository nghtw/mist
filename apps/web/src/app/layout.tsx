import "~/styles/globals.css";

import { Inter } from "next/font/google";
import Header from "./header";

const interFont = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={interFont.variable}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
