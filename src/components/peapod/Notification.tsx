'use client';

import { usePeapodNotify } from '@/hooks/usePeapod';

export default function PeapodNotification() {
  const hidden = usePeapodNotify(s => s.hidden);
  const message = usePeapodNotify(s => s.message);

  if (hidden) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
      {message}
    </div>
  );
}
