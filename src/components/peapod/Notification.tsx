'use client';

import { AnimatePresence, motion } from 'motion/react';
import { usePeapodNotify } from '@/hooks/usePeapod';
import { HeartIcon, PlusIcon, CheckIcon, CloseIcon, InfoIcon } from './icons';

const iconMap = {
  queue: <PlusIcon size="w-5 h-5" />,
  favorite: <HeartIcon size="w-5 h-5" fill="currentColor" />,
  success: <CheckIcon size="w-5 h-5" />,
  error: <CloseIcon size="w-5 h-5" />,
  info: <InfoIcon size="w-5 h-5" />
};

const bgMap: Record<string, string> = {
  info: 'bg-blue-600',
  error: 'bg-red-600'
};

export default function PeapodNotification() {
  const hidden = usePeapodNotify(s => s.hidden);
  const message = usePeapodNotify(s => s.message);
  const icon = usePeapodNotify(s => s.icon);

  const bg = (icon && bgMap[icon]) || 'bg-brand-600';

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 ${bg} text-white px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {icon && iconMap[icon]}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
