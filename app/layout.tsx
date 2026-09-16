import type { Metadata } from 'next';
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';
import './globals.css';

const bodyFont = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
});

const headingFont = Bricolage_Grotesque({
  variable: '--font-display',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://day-of-bliss-avatar-studio.dietitianfrancisca.chatgpt.site',
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
      <body className={`${bodyFont.variable} ${headingFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
