import QRCode from 'qrcode';

import type { GuideTagLink, SeatingTable, ShareLinkOption } from '@/types/wedding';
import { guideEntryUrls } from '@/utils/weddingGuide';
import { getWeddingEnterUrl } from '@/utils/weddingRequest';
import { shareLinkUrls } from '@/utils/weddingShare';

// Server-only: keeps the QR library out of client bundles.

export const toQrSvg = (url: string): Promise<string> =>
  QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });

export const buildGuideTagLinks = async (guideKey: string, tables: SeatingTable[]): Promise<GuideTagLink[]> => {
  const enterUrl = await getWeddingEnterUrl();
  return Promise.all(guideEntryUrls(enterUrl, guideKey, tables).map(async link => ({ ...link, svg: await toQrSvg(link.url) })));
};

export const buildShareLinks = async (shareKey: string): Promise<ShareLinkOption[]> => {
  const enterUrl = await getWeddingEnterUrl();
  return Promise.all(shareLinkUrls(enterUrl, shareKey).map(async link => ({ ...link, svg: await toQrSvg(link.url) })));
};
