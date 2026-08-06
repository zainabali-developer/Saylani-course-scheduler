import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});
const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Saylani Weekend Classes",
  description: "Weekend courses timetable — courses, teachers, and the live schedule.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-ink text-paper font-body min-h-screen flex flex-col">
        <header className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3">
            <Link href="/" className="font-display font-bold text-base sm:text-lg tracking-tight shrink-0">
              Saylani Weekend Classes
            </Link>
            <nav className="flex items-center gap-3.5 sm:gap-6 text-xs sm:text-sm text-paper/70 overflow-x-auto">
              <Link href="/courses" className="hover:text-paper transition-colors whitespace-nowrap">Courses</Link>
              <Link href="/timetable" className="hover:text-paper transition-colors whitespace-nowrap">Timetable</Link>
              <Link href="/teachers" className="hover:text-paper transition-colors whitespace-nowrap">Teachers</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/10 mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-xs text-paper/40 flex items-center justify-between">
            <span>Saylani Weekend Classes</span>
            <Link href="/admin/login" className="hover:text-paper/70 transition-colors">Admin</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
