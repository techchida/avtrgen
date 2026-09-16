import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://day-of-bliss-avatar-studio.ochre-ibis-4630.chatgpt.site',
  ),
  title: 'Day of Bliss Avatar Studio',
  description:
    'Add your photo to the Day of Bliss event artwork and download a share-ready image.',
  openGraph: {
    title: 'Day of Bliss Avatar Studio',
    description: 'Put yourself in the picture.',
    images: [{ url: '/og.png', width: 1733, height: 908 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Day of Bliss Avatar Studio',
    description: 'Put yourself in the picture.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
