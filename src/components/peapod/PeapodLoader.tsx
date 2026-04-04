'use client';

import { motion } from 'motion/react';

export default function PeapodLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <motion.svg
        viewBox="0 0 512 512"
        className="w-16 h-16 text-brand-400"
        fillRule="evenodd"
        clipRule="evenodd"
        animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Circle outline */}
        <circle cx="256" cy="256" r="232" fill="none" stroke="currentColor" strokeWidth="24" />
        {/* Left eye */}
        <motion.circle
          cx="172"
          cy="195"
          r="24"
          fill="currentColor"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Right eye */}
        <motion.circle
          cx="292"
          cy="195"
          r="24"
          fill="currentColor"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        />
        {/* Smile */}
        <motion.path
          d="M130 268 C130 268 130 254 144 254 L336 254 C350 254 350 268 350 268 C350 362 302 405 240 405 C178 405 130 362 130 268 Z"
          fill="currentColor"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          style={{ transformOrigin: '240px 330px' }}
        />
      </motion.svg>
      <p className="text-neutral-400 text-sm">
        {text}
      </p>
    </div>
  );
}
