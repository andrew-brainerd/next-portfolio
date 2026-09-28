'use client';

import type { GuideMe } from '@/types/wedding';
import { useLocalJson } from './useLocalJson';

/** The guest's own seat, remembered on this device after "This is me". Shared by every component using it. */
export const useGuideMe = (): [GuideMe | undefined, (me: GuideMe | undefined) => void] => {
  const [me, setMe] = useLocalJson<GuideMe>('wedding:guide:me');
  return [me?.tableId && me.name ? me : undefined, setMe];
};
