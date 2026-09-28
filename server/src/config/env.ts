import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root or server directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

export interface ServerConfig {
  port: number;
  mtnEnv: string;
  mtnBaseUrl: string;
  mtnSubscriptionKey: string;
  mtnApiUser: string;
  mtnApiKey: string;
  mtnTargetEnvironment: string;
  mtnCallbackUrl: string;
  mtnCurrency: string;
  storeCurrency: string;
}

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '5001', 10),
  mtnEnv: process.env.MTN_ENV || 'sandbox',
  mtnBaseUrl: process.env.MTN_BASE_URL || 'https://sandbox.momodeveloper.mtn.com',
  mtnSubscriptionKey: process.env.MTN_COLLECTION_SUBSCRIPTION_KEY || '',
  mtnApiUser: process.env.MTN_API_USER || '',
  mtnApiKey: process.env.MTN_API_KEY || '',
  mtnTargetEnvironment: process.env.MTN_TARGET_ENVIRONMENT || 'sandbox',
  mtnCallbackUrl: process.env.MTN_CALLBACK_URL || '',
  mtnCurrency: process.env.MTN_CURRENCY || 'EUR',
  storeCurrency: process.env.STORE_CURRENCY || 'USD',
};

/**
 * Checks if real MTN MoMo sandbox credentials are provided
 */
export function isMtnConfigured(): boolean {
  return Boolean(
    config.mtnSubscriptionKey.trim() &&
    config.mtnApiUser.trim() &&
    config.mtnApiKey.trim()
  );
}

/**
 * Returns safe diagnostic configuration without leaking secret keys
 */
export function getSafeConfigDiagnostic() {
  const missingKeys: string[] = [];
  if (!config.mtnSubscriptionKey.trim()) missingKeys.push('MTN_COLLECTION_SUBSCRIPTION_KEY');
  if (!config.mtnApiUser.trim()) missingKeys.push('MTN_API_USER');
  if (!config.mtnApiKey.trim()) missingKeys.push('MTN_API_KEY');

  const configured = isMtnConfigured();

  return {
    environment: config.mtnTargetEnvironment,
    isConfigured: configured,
    statusText: configured ? 'MTN MoMo: CONFIGURED' : 'MTN MoMo: NOT CONFIGURED',
    missingKeys,
    mtnCurrency: config.mtnCurrency,
    storeCurrency: config.storeCurrency,
    baseUrl: config.mtnBaseUrl,
    hasCallbackUrl: Boolean(config.mtnCallbackUrl.trim()),
    callbackUrl: config.mtnCallbackUrl || 'Not configured (using status polling)',
    mode: configured ? 'LIVE_SANDBOX' : 'NOT_CONFIGURED',
  };
}
