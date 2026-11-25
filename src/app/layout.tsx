import type { Metadata } from "next";
import { Geist, Geist_Mono, Michroma } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import { IntroProvider } from "@/components/intro";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist" });
const display = Michroma({ subsets: ["latin"], weight: "400", variable: "--font-michroma" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Joton Sutradhar — Full-Stack Developer",
  description:
    "Full-stack developer building airline booking systems, e-commerce platforms and AI products with Django, Laravel, Next.js and Flutter.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${display.variable}`}>
      <body className="font-sans">
        <MotionProvider>
          <IntroProvider>{children}</IntroProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
