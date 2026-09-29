'use client';

import { createContext, useContext, type ReactNode } from 'react';

const WeddingClockContext = createContext(0);

interface WeddingClockProviderProps {
  offsetMs: number;
  children: ReactNode;
}

// ms added to the real clock: the WEDDING_ADMINS mock clock, 0 for everyone else
export const WeddingClockProvider = ({ offsetMs, children }: WeddingClockProviderProps) => (
  <WeddingClockContext value={offsetMs}>{children}</WeddingClockContext>
);

export const useWeddingClockOffset = (): number => useContext(WeddingClockContext);
