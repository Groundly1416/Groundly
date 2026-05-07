import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Groundly — Book Private Outdoor Spaces for Creative Shoots',
  description: 'Private outdoor spaces — gardens, estates, waterfront, and meadows. Bookable by the hour. Built for the photographers who shoot in them.',
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
