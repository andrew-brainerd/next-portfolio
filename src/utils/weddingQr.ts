import { headers } from 'next/headers';
import QRCode from 'qrcode';

import type { GuideTagLink, SeatingTable, ShareLinkOption } from '@/types/wedding';
import { guideEntryUrls } from '@/utils/weddingGuide';
import { shareLinkUrls } from '@/utils/weddingShare';

// Server-only: keeps the QR library out of client bundles.

/** Origin of the current request, so tag URLs match whichever host the owner is on. */
export const getRequestOrigin = async (): Promise<string> => {
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000';
  const proto = headerList.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
};

export const buildGuideTagLinks = async (guideKey: string, tables: SeatingTable[]): Promise<GuideTagLink[]> => {
  const origin = await getRequestOrigin();
  return Promise.all(
    guideEntryUrls(origin, guideKey, tables).map(async link => ({
      ...link,
      svg: await QRCode.toString(link.url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
    }))
  );
};

export const buildShareLinks = async (shareKey: string): Promise<ShareLinkOption[]> => {
  const origin = await getRequestOrigin();
  return Promise.all(
    shareLinkUrls(origin, shareKey).map(async link => ({
      ...link,
      svg: await QRCode.toString(link.url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
    }))
  );
};
