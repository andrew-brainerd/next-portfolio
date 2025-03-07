'use server';

import { cookies } from 'next/headers';

export const getCookie = async (name: string) => {
  const cookieJar = await cookies();
  return cookieJar.get(name)?.value || '';
};
