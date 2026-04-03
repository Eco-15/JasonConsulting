import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error, description: searchParams.get('error_description') }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }

  const baseUrl = request.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/linkedin/callback`;

  // Exchange code for tokens
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
  });

  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString(),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.json({ error: `Token exchange failed: ${tokenRes.status} ${text}` }, { status: 500 });
  }

  const tokens = await tokenRes.json();
  const { access_token, refresh_token, expires_in } = tokens;
  const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  // Fetch person ID from userinfo endpoint
  const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userinfoRes.ok) {
    const text = await userinfoRes.text();
    return NextResponse.json({ error: `Userinfo fetch failed: ${userinfoRes.status} ${text}` }, { status: 500 });
  }

  const userinfo = await userinfoRes.json();
  const personId: string = userinfo.sub;
  const orgId = process.env.LINKEDIN_ORG_ID ?? '';

  // Upsert token row (always maintain a single row)
  const supabase = getServiceClient();
  const { error: upsertError } = await supabase
    .from('linkedin_tokens')
    .upsert(
      {
        access_token,
        refresh_token: refresh_token ?? null,
        expires_at: expiresAt,
        person_id: personId,
        org_id: orgId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'person_id' }
    );

  if (upsertError) {
    return NextResponse.json({ error: `Supabase upsert failed: ${upsertError.message}` }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    person_id: personId,
    expires_at: expiresAt,
    message: `Tokens stored. Set LINKEDIN_PERSON_ID=${personId} in your env vars.`,
  });
}
