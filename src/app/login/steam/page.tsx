import { Suspense } from 'react';

import { SteamSignInCallback } from 'components/SteamSignInCallback';

export const metadata = {
  title: 'Signing in with Steam'
};

export default function SteamSignInPage() {
  return (
    <Suspense>
      <SteamSignInCallback />
    </Suspense>
  );
}
