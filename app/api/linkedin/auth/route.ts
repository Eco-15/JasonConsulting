import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const setupKey = searchParams.get('setup_key');

  if (!setupKey || setupKey !== process.env.LINKEDIN_SETUP_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'LINKEDIN_CLIENT_ID not configured' }, { status: 500 });
  }

  const baseUrl = request.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/linkedin/callback`;

  const scopes = [
    'openid',
    'profile',
    'r_organization_social',
    // Uncomment once LinkedIn Partner Program approves r_member_social:
    // 'r_member_social',
  ];

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state: process.env.LINKEDIN_SETUP_KEY!,
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
