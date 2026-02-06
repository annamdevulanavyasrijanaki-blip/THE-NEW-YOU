// DO import React to resolve 'React' namespace error for React.ReactNode
import React from 'react';
import './globals.css';
import { Lora, Montserrat } from 'next/font/google';

const lora = Lora({ 
  subsets: ['latin'], 
  variable: '--font-serif',
  display: 'swap' 
});

const montserrat = Montserrat({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap' 
});

export const metadata = {
  title: 'The New You - High-Fidelity AI Fashion',
  description: 'Redefining the human silhouette through neural couture.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lora.variable} ${montserrat.variable}`}>
      <body className="font-sans selection:bg-brand-champagne/30 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}