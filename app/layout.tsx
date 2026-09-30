import type { Metadata } from 'next';
import './globals.css'; // Keep the global styles

export const metadata: Metadata = {
  title: 'AI Interview System',
  description: 'Professional interview evaluation platform',
};

import { Sidebar } from '../components/layout/Sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Sidebar>
          {children}
        </Sidebar>
      </body>
    </html>
  );
}
