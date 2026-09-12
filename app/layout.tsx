import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Custom Casio Royale – JellyLab Watches',
  description:
    'A custom Royale build where you select all of the materials and colors. ' +
    'Pick a case, a band, window colors or decals, text removal and laser engraving.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#121212',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
