import { createClient } from '@supabase/supabase-js';
import type { LinkedInTokenRow } from '@/lib/types/linkedin';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
  });

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LinkedIn token refresh failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getLinkedInTokens(): Promise<LinkedInTokenRow> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('linkedin_tokens')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error('No LinkedIn tokens found. Run the OAuth flow first.');
  }

  const row = data as LinkedInTokenRow;
  const expiresAt = new Date(row.expires_at);
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (expiresAt <= new Date()) {
    if (!row.refresh_token) {
      throw new Error('LinkedIn access token is expired and no refresh token is available. Re-run the OAuth flow.');
    }
    // Token is expired — refresh it
    const refreshed = await refreshAccessToken(row.refresh_token);
    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

    await supabase
      .from('linkedin_tokens')
      .update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token ?? row.refresh_token,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);

    return {
      ...row,
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token ?? row.refresh_token,
      expires_at: newExpiresAt,
    };
  }

  // Token expires within 7 days — proactively refresh
  if (expiresAt <= sevenDaysFromNow && row.refresh_token) {
    try {
      const refreshed = await refreshAccessToken(row.refresh_token);
      const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

      await supabase
        .from('linkedin_tokens')
        .update({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token ?? row.refresh_token,
          expires_at: newExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);

      return {
        ...row,
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token ?? row.refresh_token,
        expires_at: newExpiresAt,
      };
    } catch {
      // Best-effort refresh; proceed with existing valid token
    }
  }

  return row;
}
