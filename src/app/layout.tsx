import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BotonSubir from '../app/components/BotonSubir';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Consumo de Agua y Energía',
  description: 'Aprende Next.js construyendo una Pokédex',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <BotonSubir /> {/* 👈 AQUÍ */}
      </body>
    </html>
  );
}