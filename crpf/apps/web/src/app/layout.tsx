import { Plus_Jakarta_Sans, Work_Sans } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-work' });

export const metadata: Metadata = {
  title: 'CRPF ServeSmart Canteen',
  description: 'Digital Concierge for CRPF Canteen Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${jakarta.variable} ${workSans.variable} font-body min-h-full flex flex-col antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
