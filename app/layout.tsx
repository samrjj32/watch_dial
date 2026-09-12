import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Custom Casio Royale · Build yours — JellyLab Watches',
  description:
    'Configure a Casio Royale end to end: case and band materials, a colour or decal for ' +
    'every window, printed text removal and laser engraving on the caseback.',
  applicationName: 'JellyLab Royale Builder',
  openGraph: {
    title: 'Custom Casio Royale · JellyLab Watches',
    description:
      'Configure a Casio Royale end to end: case, band, window colours and decals, ' +
      'text removal and laser engraving.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f6f4fa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        {/* The watch artwork is the page's largest paint; start it with the HTML. */}
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="" />
        <link rel="preconnect" href="https://jellylabwatches.com" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
