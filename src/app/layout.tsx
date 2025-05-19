import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a child-friendly, rounded alternative
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans', // Keep variable name for compatibility, Geist is good too
});


export const metadata: Metadata = {
  title: 'Nursery Rhyme Swinger',
  description: 'An interactive rhythm game for kids!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, "antialiased font-sans")}>
        <div className="flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 flex flex-col items-center justify-center p-4">
            {children}
          </main>
          <AppFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
