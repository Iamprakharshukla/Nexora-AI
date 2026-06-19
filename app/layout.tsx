import './globals.css';
import type { Metadata } from 'next';
import CustomCursor from '../components/CustomCursor';

export const metadata: Metadata = {
  title: 'NEXORA AI | Immersive E-Commerce Universe',
  description: 'Unicorn-tier AI-powered luxury marketplace built with Next.js 15, Framer Motion, and WebGL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-black text-white selection:bg-[#00ffcc] selection:text-black min-h-screen overflow-x-hidden">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
