export interface LinkedInPost {
  id: string;
  author_type: 'personal' | 'company';
  author_name: string;
  text_content: string;
  published_at: string;
  likes_count: number;
  comments_count: number;
  linkedin_url: string | null;
  cached_at?: string;
}

export interface LinkedInTokenRow {
  id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
  person_id: string;
  org_id: string;
  updated_at: string;
}
