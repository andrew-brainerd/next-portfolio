import { cookies } from 'next/headers';

import { TOKEN_COOKIE, WEDDING_MOCK_OFFSET_COOKIE, WEDDING_UNLOCK_COOKIE } from '@/constants/authentication';
import { getPublicWeddingConfig, isWeddingAdmin, verifyWeddingPasscode } from '@/api/wedding';
import type { WeddingAccess } from '@/types/wedding';
import { parseMockOffset } from '@/utils/weddingClock';
import { getWeddingFeatures } from '@/utils/weddingFeatures';

/**
 * Shared by every guest route: the unlock cookie is re-verified on each render (rotating a
 * code re-locks old cookies), WEDDING_ADMINS skip the gate, and the release windows follow the
 * mock clock when one is set (admin panel or a share link's preview date). Admins on the real
 * clock preview every page.
 */
export const loadWeddingAccess = async (): Promise<WeddingAccess> => {
  const cookieJar = await cookies();
  const code = cookieJar.get(WEDDING_UNLOCK_COOKIE)?.value;
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  const isAdmin = token ? await isWeddingAdmin() : false;
  const unlocked = isAdmin || (code ? await verifyWeddingPasscode(code) : false);
  if (!unlocked) return { unlocked: false };

  const config = await getPublicWeddingConfig();
  // Admins set it with the mock clock panel; guests get it from a share link's preview date
  const clockOffset = parseMockOffset(cookieJar.get(WEDDING_MOCK_OFFSET_COOKIE)?.value);
  const requestTime = Date.now() + clockOffset;
  const features = config ? getWeddingFeatures(config, requestTime, !isAdmin || clockOffset > 0) : undefined;

  return { unlocked: true, isAdmin, clockOffset, requestTime, config, features };
};
