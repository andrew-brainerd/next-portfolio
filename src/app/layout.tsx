import { Oswald, Pacifico, Roboto_Mono } from 'next/font/google';

import 'styles/index.css';

const oswald = Oswald({ subsets: ['latin'] });
const pacifico = Pacifico({ subsets: ['latin'], weight: '400' });
const roboto = Roboto_Mono({ subsets: ['latin'] });

export const metadata = {
  title: 'A. Brainerd',
  description: 'Andrew Brainerd Personal Website'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.className} ${oswald.className} ${pacifico.className}`}>
      <body className="bg-neutral-600 text-[#ffffff] m-0 overflow-y-scroll">{children}</body>
    </html>
  );
}
