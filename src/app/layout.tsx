import { Oswald, Pacifico, Roboto_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { headers } from 'next/headers';
import ConditionalNavigation from '@/components/ConditionalNavigation';
import ThemeProvider from '@/providers/ThemeProvider';
import { TOKEN_COOKIE } from '@/constants/authentication';
import 'styles/index.css';

const allThemes = ['ocean', 'sunset', 'forest', 'lavender'];

async function getRandomTheme() {
  // Use a request-unique value to seed the pick
  const hdrs = await headers();
  const requestId = hdrs.get('x-request-id') || hdrs.get('x-vercel-id') || String(Date.now());
  // Simple hash to get a stable-per-request index
  let hash = 0;
  for (let i = 0; i < requestId.length; i++) {
    hash = (hash * 31 + requestId.charCodeAt(i)) | 0;
  }
  return allThemes[Math.abs(hash) % allThemes.length];
}

const themeScript = `
(function() {
  try {
    var existing = sessionStorage.getItem('theme');
    if (existing) {
      document.documentElement.setAttribute('data-theme', existing);
    } else {
      var serverTheme = document.documentElement.getAttribute('data-theme');
      if (serverTheme) sessionStorage.setItem('theme', serverTheme);
    }
  } catch (e) {}
})();
`;

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
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  const isLoggedIn = !!token;
  const randomTheme = await getRandomTheme();

  return (
    <html
      lang="en"
      data-theme={randomTheme}
      className={`${roboto.variable} ${oswald.variable} ${pacifico.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
        <ThemeProvider>
          <ConditionalNavigation isLoggedIn={isLoggedIn} />
          <div id="main-content">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
