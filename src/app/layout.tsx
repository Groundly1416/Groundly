import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Groundly — Book Private Outdoor Spaces for Creative Shoots',
  description: 'Discover and book premium private estates, gardens, and outdoor spaces for photography and creative productions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
