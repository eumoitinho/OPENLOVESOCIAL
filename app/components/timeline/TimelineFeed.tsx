"use client"

import { PostCard } from "./PostCard"

interface TimelineFeedProps {
  posts: any[]
  handleLike: (postId: string) => void
  handleComment: (postId: string) => void
  handleShare: (postId: string) => void
  toggleFollow: (username: string) => void
}

export function TimelineFeed({ posts, handleLike, handleComment, handleShare, toggleFollow }: TimelineFeedProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onFollow={toggleFollow}
        />
      ))}
    </div>
  )
}
