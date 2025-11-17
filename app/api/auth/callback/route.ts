import { NextRequest, NextResponse } from 'next/server';
import { handleAuthCallback } from '@/app/actions/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=missing_code', request.url)
    );
  }

  const result = await handleAuthCallback(code);

  if (!result.success) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(result.error || 'auth_failed')}`, request.url)
    );
  }

  // In a production app, you would store the tokens securely in a database or session
  // For now, we redirect to the home page with a success message
  return NextResponse.redirect(
    new URL('/?auth=success', request.url)
  );
}
