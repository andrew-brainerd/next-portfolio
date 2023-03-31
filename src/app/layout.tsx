export const metadata = {
  title: 'A. Brainerd',
  description: 'Andrew Brainerd Personal Website'
};

import 'styles/index.scss';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
