import * as SecureStore from 'expo-secure-store';
import { getAccessToken, getRefreshToken, isTokenExpired, saveAccessToken } from './secureStore';   // assume you made isTokenExpired in a file called auth.ts
import { API_BASE_URLS } from './constant';

interface FetchOptions extends RequestInit {} // RequestInit is already built-in type for fetch options

export async function fetchWithAuth(url: string, options: FetchOptions = {}): Promise<Response> {
  let accessToken = await getAccessToken()

  if (!accessToken || isTokenExpired(accessToken)) {
    const refreshToken = await getRefreshToken()

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const refreshed = await fetch(`${API_BASE_URLS}/api/user/refresh-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        'Content-Type': 'application/json', // safer to send header for POST
      },
    });

    if (!refreshed.ok) {
      throw new Error('Could not refresh token');
    }

    const data = await refreshed.json() as { accessToken: string }; // telling TypeScript what we expect
    const { accessToken: newToken } = data;

    await saveAccessToken(newToken); // save the new access token to secure storage
    accessToken = newToken;
  }

  // Make the actual API request
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response;
}
