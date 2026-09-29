'use server';

import { toQrSvg } from '@/utils/weddingQr';

/** QR code for a share link with a preview date (the plain links' QR codes are built with the page). */
export const getShareLinkQrSvg = async (url: string): Promise<string> => toQrSvg(url);
