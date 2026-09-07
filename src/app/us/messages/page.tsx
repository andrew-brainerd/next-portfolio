import type { Metadata } from 'next';

import { getMessageStats } from '@/api/us';
import { MessagesDashboard } from '@/components/us/messages/MessagesDashboard';

export const metadata: Metadata = {
  title: 'Us — Messages',
  // Unlisted: anyone with the link can read it, but it should not be indexed
  robots: { index: false, follow: false }
};

// Stats are pushed manually from a local export, so there is nothing to
// revalidate on a timer — but skip the build-time snapshot so a fresh upload
// shows up without a redeploy.
export const dynamic = 'force-dynamic';

export default async function UsMessagesPage() {
  const stats = await getMessageStats();

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-neutral-400">
          No message stats have been uploaded yet. Run <code className="text-neutral-300">pnpm upload:message-stats</code>{' '}
          in brainerd-api.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <MessagesDashboard stats={stats} />
    </div>
  );
}
