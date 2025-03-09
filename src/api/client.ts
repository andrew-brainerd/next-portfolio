'use server';

import axios, { type AxiosError, type Method } from 'axios';
import { cookies } from 'next/headers';

import { TOKEN_COOKIE } from 'constants/authentication';

export interface RequestParams {
  [key: string]: string | undefined;
}

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BRAINERD_API_URL,
  withCredentials: true
});

const getAuthHeaders = async () => {
  const cookieJar = await cookies();
  const token = cookieJar.get(TOKEN_COOKIE)?.value;

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const handleError = (method: Method, url: string, err: AxiosError) => {
  console.error(`${method} ${url}: ${err.message}`, global.window);
};

export const postRequest = async <T, R>(url: string, data?: T): Promise<R> => {
  const headers = await getAuthHeaders();
  console.log('POST request', { headers, url, data });
  return client.post(url, data || {}, { headers }).then(response => response?.data);
};

export const patchRequest = async <T, R>(url: string, data: T): Promise<R> => {
  const headers = await getAuthHeaders();
  return client
    .patch(url, data, { headers })
    .then(response => response?.data)
    .catch((err: AxiosError) => handleError('PATCH', url, err));
};

export const getRequest = async <T>(url: string, params?: RequestParams): Promise<T | undefined> => {
  const headers = await getAuthHeaders();
  return client
    .get(url, { params, headers })
    .then(response => response?.data)
    .catch((err: AxiosError) => handleError('GET', url, err));
};

export const deleteRequest = async (url: string): Promise<void> => {
  const headers = await getAuthHeaders();
  return client
    .delete(url, { headers })
    .then(response => response?.data)
    .catch((err: AxiosError) => handleError('DELETE', url, err));
};
