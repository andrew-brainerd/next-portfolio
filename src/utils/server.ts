'use server';

import { cookies } from 'next/headers';

export const getCookie = async (name: string): Promise<string> => {
  const cookieJar = await cookies();
  return cookieJar.get(name)?.value || '';
};
