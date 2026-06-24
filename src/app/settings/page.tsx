import { redirect } from 'next/navigation';

// Appearance settings moved to the public /appearance route. Keep /settings working (and
// reserved for future account-only settings) by redirecting for now.
export default function SettingsPage() {
  redirect('/appearance');
}
