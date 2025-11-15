import { Oswald, Pacifico, Roboto_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import ConditionalNavigation from '@/components/ConditionalNavigation';
import { USER_COOKIE } from '@/constants/authentication';
import 'styles/index.css';

const oswald = Oswald({ subsets: ['latin'], display: 'swap', variable: '--font-oswald' });
const pacifico = Pacifico({ subsets: ['latin'], weight: '400', display: 'swap', variable: '--font-pacifico' });
const roboto = Roboto_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-roboto' });

export const metadata: Metadata = {
  title: {
    default: 'Andrew Brainerd - Software Engineer',
    template: '%s | Andrew Brainerd'
  },
  description:
    'Personal portfolio and gaming stats for Andrew Brainerd, a software engineer specializing in web development.',
  keywords: ['Andrew Brainerd', 'Software Engineer', 'Web Developer', 'Portfolio', 'Gaming'],
  authors: [{ name: 'Andrew Brainerd', url: 'https://brainerd.dev' }],
  creator: 'Andrew Brainerd',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://brainerd.dev',
    siteName: 'Andrew Brainerd',
    title: 'Andrew Brainerd - Software Engineer',
    description:
      'Personal portfolio and gaming stats for Andrew Brainerd, a software engineer specializing in web development.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Andrew Brainerd - Software Engineer',
    description:
      'Personal portfolio and gaming stats for Andrew Brainerd, a software engineer specializing in web development.'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      'index': true,
      'follow': true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieJar = await cookies();
  const userId = cookieJar.get(USER_COOKIE)?.value;
  const isLoggedIn = !!userId;

  return (
    <html lang="en" className={`${roboto.variable} ${oswald.variable} ${pacifico.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#191919] text-[#ffffff] m-0 overflow-y-scroll">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-brand-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to main content
        </a>
        <ConditionalNavigation isLoggedIn={isLoggedIn} />
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
