import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TOKEN_COOKIE } from '@/constants/authentication';
import { LOGIN_ROUTE, ROLL_WITH_ME_ROUTE } from '@/constants/routes';
import { Menu } from '@/components/roll-with-me/Menu';

export default async function RollWithMePage() {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;
  if (!token) {
    redirect(`${LOGIN_ROUTE}?from=${encodeURIComponent(ROLL_WITH_ME_ROUTE)}`);
  }
  return <Menu />;
}
