import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Groundly — Book Private Outdoor Spaces for Creative Shoots',
  description: 'Private gardens, estates, waterfront, and meadows. Bookable by the hour, built for photographers.',
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
