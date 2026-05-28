import { LoginTabs } from 'components/LoginTabs';

interface LoginPageProps {
  searchParams: Promise<{ returnTo?: string; from?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectRoute = params.returnTo || params.from || '/';
  const fromPath = params.from || '/';

  return <LoginTabs redirectRoute={redirectRoute} fromPath={fromPath} />;
}
