import "~/styles/globals.css";

import { Inter } from "next/font/google";
import Header from "./header";
import { SessionProvider } from "~/components/providers/session-provider";
import { getCurrentSession } from "~/lib/session";

const interFont = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {


  const { session, user } = await getCurrentSession();

  console.log('user', user);


  return (
    <html lang="en" className={interFont.variable}>
      <body>
        <SessionProvider session={{ user, session }}>
          <div className="absolute top-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
            <Header />
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
