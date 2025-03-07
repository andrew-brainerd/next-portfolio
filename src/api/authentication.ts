export const bakeCookie = async (token: string) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BRAINERD_API_URL;
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
