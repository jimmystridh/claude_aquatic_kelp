import { VismaEAccounting } from '@visma-eaccounting/client';

let vismaClient: VismaEAccounting | null = null;

/**
 * Get or create Visma eAccounting client instance
 */
export function getVismaClient(): VismaEAccounting {
  if (!vismaClient) {
    const accessToken = process.env.VISMA_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error(
        'VISMA_ACCESS_TOKEN not found. Please complete OAuth flow first.'
      );
    }

    vismaClient = new VismaEAccounting({
      accessToken,
    });
  }

  return vismaClient;
}

/**
 * Update the access token for the Visma client
 */
export function updateAccessToken(token: string): void {
  if (!vismaClient) {
    vismaClient = new VismaEAccounting({ accessToken: token });
  } else {
    vismaClient.setAccessToken(token);
  }
}

/**
 * Get OAuth configuration
 */
export function getOAuthConfig() {
  const clientId = process.env.VISMA_CLIENT_ID;
  const clientSecret = process.env.VISMA_CLIENT_SECRET;
  const redirectUri = process.env.VISMA_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing OAuth configuration. Please set VISMA_CLIENT_ID, VISMA_CLIENT_SECRET, and VISMA_REDIRECT_URI'
    );
  }

  return { clientId, clientSecret, redirectUri };
}
