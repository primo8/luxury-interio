import { config, isMtnConfigured } from '../../config/env';
import type { MtnTokenResponse } from '../../types/payment';

interface CachedToken {
  accessToken: string;
  expiresAt: number; // timestamp in ms
}

let cachedToken: CachedToken | null = null;

/**
 * Generates or retrieves a valid OAuth 2.0 access token for MTN MoMo Collection API
 */
export async function getMtnAccessToken(): Promise<{ token: string; isSimulated: boolean; error?: string }> {
  // If real credentials are not fully configured, provide a simulated token for sandbox development
  if (!isMtnConfigured()) {
    return {
      token: 'simulated_sandbox_token_' + Date.now(),
      isSimulated: true,
    };
  }

  // Check if current cached token is still valid (with 60s buffer)
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return {
      token: cachedToken.accessToken,
      isSimulated: false,
    };
  }

  try {
    const basicAuth = Buffer.from(`${config.mtnApiUser}:${config.mtnApiKey}`).toString('base64');
    const tokenUrl = `${config.mtnBaseUrl.replace(/\/+$/, '')}/collection/token/`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Ocp-Apim-Subscription-Key': config.mtnSubscriptionKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MTN Auth Error]', response.status, errorText);
      return {
        token: '',
        isSimulated: false,
        error: `MTN OAuth authentication failed (${response.status}): ${response.statusText}`,
      };
    }

    const data = (await response.json()) as MtnTokenResponse;
    const expiresInMs = (data.expires_in || 3600) * 1000;

    cachedToken = {
      accessToken: data.access_token,
      expiresAt: now + expiresInMs,
    };

    return {
      token: data.access_token,
      isSimulated: false,
    };
  } catch (err: any) {
    console.error('[MTN Auth Exception]', err);
    return {
      token: '',
      isSimulated: false,
      error: `Connection to MTN MoMo Gateway failed: ${err.message || 'Unknown network error'}`,
    };
  }
}

/**
 * Clears cached token (for testing or token refresh)
 */
export function clearTokenCache(): void {
  cachedToken = null;
}
