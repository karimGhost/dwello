import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dwello - Modern Furniture & Home Appliances',
  description: 'Sophisticated living through curated design and intelligent home solutions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen selection:bg-primary/20">{children}</body>
    </html>
  );
}