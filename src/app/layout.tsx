// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './ThemeContext';
import { FontSizeProvider } from '../../FontSizeContext'; // 👈 importamos el nuevo contexto

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ConvocApp',
  description: 'Aprende Next.js construyendo una Pokédex',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <FontSizeProvider>
            {children}
          </FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
