'use client';

import { useState } from 'react';
import { ExternalLink, ThumbsUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LinkedInPost } from '@/lib/types/linkedin';

const TRUNCATE_LENGTH = 280;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function LinkedInPostCard({ post }: { post: LinkedInPost }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = post.text_content.length > TRUNCATE_LENGTH;
  const displayText =
    expanded || !isLong
      ? post.text_content
      : post.text_content.slice(0, TRUNCATE_LENGTH) + '…';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="gold-gradient flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm shadow-sm flex-shrink-0">
          JG
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{post.author_name}</p>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                post.author_type === 'personal'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {post.author_type === 'personal' ? 'Personal' : 'Company'}
            </span>
            <span className="text-xs text-gray-500">{formatDate(post.published_at)}</span>
          </div>
        </div>
      </div>

      {/* Post text */}
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {displayText}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-[#d4af37] font-medium hover:underline self-start"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {post.likes_count > 0 && (
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              {post.likes_count.toLocaleString()}
            </span>
          )}
          {post.comments_count > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {post.comments_count.toLocaleString()}
            </span>
          )}
        </div>
        {post.linkedin_url && (
          <Button variant="outline" size="sm" asChild>
            <a href={post.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs">
              View on LinkedIn
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
