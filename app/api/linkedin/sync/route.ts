import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getLinkedInTokens } from '@/lib/linkedin/tokens';
import { fetchCompanyPosts, fetchPersonalPosts } from '@/lib/linkedin/api';
import type { LinkedInPost } from '@/lib/types/linkedin';

export const dynamic = 'force-dynamic';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const syncSecret = process.env.LINKEDIN_SYNC_SECRET;

  if (!syncSecret || authHeader !== `Bearer ${syncSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tokens;
  try {
    tokens = await getLinkedInTokens();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const posts: LinkedInPost[] = [];

  // Fetch company posts
  if (tokens.org_id) {
    try {
      const companyPosts = await fetchCompanyPosts(tokens.access_token, tokens.org_id);
      posts.push(...companyPosts);
    } catch (err) {
      console.error('Company posts fetch error:', err);
    }
  }

  // Fetch personal posts if LINKEDIN_PERSON_ID is configured
  const personId = process.env.LINKEDIN_PERSON_ID ?? tokens.person_id;
  if (personId) {
    try {
      const personalPosts = await fetchPersonalPosts(tokens.access_token, personId);
      posts.push(...personalPosts);
    } catch (err) {
      // r_member_social may not be approved yet — log but don't fail
      console.error('Personal posts fetch error (r_member_social may not be approved):', err);
    }
  }

  if (posts.length === 0) {
    return NextResponse.json({ synced: 0, message: 'No posts fetched' });
  }

  const supabase = getServiceClient();
  const rows = posts.map((p) => ({
    id: p.id,
    author_type: p.author_type,
    author_name: p.author_name,
    text_content: p.text_content,
    published_at: p.published_at,
    likes_count: p.likes_count,
    comments_count: p.comments_count,
    linkedin_url: p.linkedin_url,
    cached_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('linkedin_posts_cache')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    return NextResponse.json({ error: `Supabase upsert failed: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ synced: posts.length });
}
