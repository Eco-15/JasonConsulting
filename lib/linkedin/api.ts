import type { LinkedInPost } from '@/lib/types/linkedin';

interface RawUgcPost {
  id: string;
  author: string;
  created: { time: number };
  specificContent?: {
    'com.linkedin.ugc.ShareContent'?: {
      shareCommentary?: { text: string };
    };
  };
  socialDetail?: {
    totalSocialActivityCounts?: {
      numLikes?: number;
      numComments?: number;
    };
  };
}

export function normalizePost(
  raw: RawUgcPost,
  authorType: 'personal' | 'company',
  authorName: string
): LinkedInPost {
  const shareContent = raw.specificContent?.['com.linkedin.ugc.ShareContent'];
  const text = shareContent?.shareCommentary?.text ?? '';
  const social = raw.socialDetail?.totalSocialActivityCounts;

  // Encode the URN for the URL (colons → %3A)
  const encodedUrn = encodeURIComponent(raw.id);

  return {
    id: raw.id,
    author_type: authorType,
    author_name: authorName,
    text_content: text,
    published_at: new Date(raw.created.time).toISOString(),
    likes_count: social?.numLikes ?? 0,
    comments_count: social?.numComments ?? 0,
    linkedin_url: `https://www.linkedin.com/feed/update/${encodedUrn}/`,
  };
}

export async function fetchCompanyPosts(
  accessToken: string,
  orgId: string
): Promise<LinkedInPost[]> {
  const authorUrn = encodeURIComponent(`urn:li:organization:${orgId}`);
  const url = `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${authorUrn})&count=20`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': '202304',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LinkedIn company posts fetch failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const elements: RawUgcPost[] = data.elements ?? [];

  return elements.map((raw) => normalizePost(raw, 'company', 'Jason Graziani'));
}

export async function fetchPersonalPosts(
  accessToken: string,
  personId: string
): Promise<LinkedInPost[]> {
  const authorUrn = encodeURIComponent(`urn:li:person:${personId}`);
  const url = `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${authorUrn})&count=20`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': '202304',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LinkedIn personal posts fetch failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const elements: RawUgcPost[] = data.elements ?? [];

  return elements.map((raw) => normalizePost(raw, 'personal', 'Jason Graziani'));
}
