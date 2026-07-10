import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { TOKEN_COOKIE } from 'constants/authentication';
import { BOARD_ROUTE, LOGIN_ROUTE } from 'constants/routes';
import { BoardDisplay } from '@/components/board/BoardDisplay';

export const metadata = {
  title: 'Board'
};

export default async function BoardPage() {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;

  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(BOARD_ROUTE)}`);
  }

  return <BoardDisplay />;
}
