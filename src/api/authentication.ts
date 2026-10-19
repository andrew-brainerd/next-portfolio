import { brainerdApiBaseUrl } from '@/utils/brainerdApiUrl';

export const bakeCookie = async (token: string) => {
  const BASE_URL = brainerdApiBaseUrl();
  const response = await fetch(`${BASE_URL}/auth/session`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });

  return response.json();
};
