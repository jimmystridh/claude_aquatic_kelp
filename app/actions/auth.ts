'use server';

import { VismaEAccounting } from '@visma-eaccounting/client';
import { getOAuthConfig, updateAccessToken } from '@/lib/visma';
import { redirect } from 'next/navigation';

/**
 * Get the authorization URL to start OAuth flow
 */
export async function getAuthorizationUrl(state?: string) {
  const { clientId, redirectUri } = getOAuthConfig();

  return VismaEAccounting.getAuthorizationUrl({
    clientId,
    redirectUri,
    scope: 'ea:api ea:sales offline_access',
    state: state || crypto.randomUUID(),
  });
}

/**
 * Exchange authorization code for access token
 */
export async function handleAuthCallback(code: string) {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();

  try {
    const tokenResponse = await VismaEAccounting.getAccessToken({
      clientId,
      clientSecret,
      redirectUri,
      code,
    });

    // In production, store these tokens in a database or session
    // For now, we'll just update the client
    updateAccessToken(tokenResponse.access_token);

    return {
      success: true,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresIn: tokenResponse.expires_in,
    };
  } catch (error) {
    console.error('Failed to exchange code for token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Refresh the access token
 */
export async function refreshToken(refreshToken: string) {
  const { clientId, clientSecret } = getOAuthConfig();

  try {
    const tokenResponse = await VismaEAccounting.refreshAccessToken({
      clientId,
      clientSecret,
      refreshToken,
    });

    updateAccessToken(tokenResponse.access_token);

    return {
      success: true,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresIn: tokenResponse.expires_in,
    };
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Start OAuth flow by redirecting to authorization URL
 */
export async function startOAuthFlow() {
  const authUrl = await getAuthorizationUrl();
  redirect(authUrl);
}
