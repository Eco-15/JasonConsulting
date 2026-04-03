import { LinkedInPostCard } from '@/components/ui/linkedin-post-card';
import type { LinkedInPost } from '@/lib/types/linkedin';

export function LinkedInFeed({ posts }: { posts: LinkedInPost[] }) {
  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold mb-3">
          <span className="gold-gradient-text">LinkedIn Feed</span>
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Insights, leadership lessons, and updates from Jason Graziani.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No posts available yet.</p>
          <p className="text-sm mt-2">Check back soon — content is synced every 6 hours.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <LinkedInPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
