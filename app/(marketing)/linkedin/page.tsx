import { createClient } from '@supabase/supabase-js';
import { LinkedInFeed } from '@/components/ui/linkedin-feed';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { LinkedInPost } from '@/lib/types/linkedin';

export const revalidate = 3600;

async function getPosts(): Promise<LinkedInPost[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('linkedin_posts_cache')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Failed to fetch LinkedIn posts:', error.message);
    return [];
  }

  return (data ?? []) as LinkedInPost[];
}

export default async function LinkedInPage() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="pt-28 pb-8 text-center px-4">
        <h1 className="text-4xl font-bold mb-4">
          <span className="gold-gradient-text">Jason on LinkedIn</span>
        </h1>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Follow along for daily leadership insights, business wisdom, and behind-the-scenes updates.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild>
            <a
              href="https://www.linkedin.com/in/jason-graziani"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Follow on LinkedIn
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://www.linkedin.com/company/jason-graziani"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Company Page
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <LinkedInFeed posts={posts} />
    </main>
  );
}
