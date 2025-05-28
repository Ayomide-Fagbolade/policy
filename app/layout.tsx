import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col bg-gradient-to-r from-[#001F3F] via-[#003366] to-[#004080] text-white  w-full">
            <div className="">
              <nav className="w-full flex justify-start shadow-2xl items-start border-b border-b-foreground/10 h-16 bg-gradient-to-r from-[#001F3F] via-[#003366] to-[#004080]">
                <div className="w-full max-w-5xl text-black flex justify-between items-center p-3 px-5 text-sm">
                  <div className="text-white flex gap-5 items-center font-bold">
                    <Link href={"/"}>Poll Sense</Link>
                  </div>
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                </div>
              </nav>
              <div className="flex flex-col ">
                {children}
              </div>

              <footer className="w-full  bg-gradient-to-r from-[#001F3F] via-[#003366] to-[#004080] text-white flex items-center justify-center  text-center text-xs  py-4">
                <p>
                  Powered by SCI
   
                </p>
                <ThemeSwitcher />
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
