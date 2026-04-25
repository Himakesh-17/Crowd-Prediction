import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CrowdFlow Risk Analyzer',
  description: 'A professional crowd safety simulation platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen flex flex-col`}>
        <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-blue-500">Crowd</span>Flow
            </Link>
            <nav className="flex gap-6 text-sm font-medium text-slate-300">
              <Link href="/venue" className="hover:text-blue-400 transition-colors">Venue Setup</Link>
              <Link href="/scenario" className="hover:text-blue-400 transition-colors">Scenario</Link>
              <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
