import { redirect } from 'next/navigation';

// Account + appearance are consolidated under /settings. Keep /appearance working
// for old links and bookmarks by redirecting.
export default function AppearancePage() {
  redirect('/settings');
}
