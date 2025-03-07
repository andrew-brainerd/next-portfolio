import { MANGA_ROUTE } from 'constants/routes';
import { SignIn } from 'components/SignIn';

export default function LoginPage() {
  return <SignIn redirectRoute={MANGA_ROUTE} />;
}
