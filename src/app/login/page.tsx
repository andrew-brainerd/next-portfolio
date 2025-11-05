import { MANGA_ROUTE } from 'constants/routes';
import { SignIn } from 'components/SignIn';

interface LoginPageProps {
  searchParams: Promise<{ returnTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectRoute = params.returnTo || '/';

  return <SignIn redirectRoute={redirectRoute} />;
}
