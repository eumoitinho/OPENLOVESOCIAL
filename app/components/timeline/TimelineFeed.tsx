"use client"

import PostCard from "./PostCard"

interface Post {
  id: number
  user: {
    name: string
    username: string
    avatar: string
    verified: boolean
    premium: boolean
    location: string
    relationshipType: string
    isPrivate: boolean
  }
  content: string
  images: string[] | null
  video: string | null
  event: {
    title: string
    date: string
    location: string
    attendees: number
    image: string
  } | null
  likes: number
  comments: number
  shares: number
  reposts: number
  liked: boolean
  saved: boolean
  timestamp: string
}

interface ProfileCard {
  id: number
  name: string
  verified: boolean
  description: string
  backgroundImage: string
  rating: number
  revenue: string
  rate: string
}

interface TimelineFeedProps {
  posts: Post[]
  profileCards: ProfileCard[]
  onLike: (postId: number) => void
  onSave: (postId: number) => void
  onFollow: (postId: number, isPrivate: boolean) => void
  followStates: Record<number, "follow" | "requested" | "following">
}

export function TimelineFeed({ posts, profileCards, onLike, onSave, onFollow, followStates }: TimelineFeedProps) {
  const ProfileCard = ({ profile }: { profile: ProfileCard }) => (
    <div className="relative max-w-sm w-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg h-96">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${profile.backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-bold">{profile.name}</h3>
          {profile.verified && (
            <svg className="w-5 h-5 fill-sky-500 text-white" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <p className="text-sm text-gray-200 mb-4">{profile.description}</p>

        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="flex items-center gap-1 text-lg font-semibold">
              <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {profile.rating}
            </div>
            <div className="text-xs text-gray-300">Review</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{profile.revenue}</div>
            <div className="text-xs text-gray-300">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{profile.rate}</div>
            <div className="text-xs text-gray-300">Rate</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-lg font-medium">
            <svg className="w-4 h-4 mr-2 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contatar
          </button>
          <button className="border-gray-600 bg-gray-800 hover:bg-gray-700 p-2 rounded-lg">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4 space-y-6">
      {posts.map((post, index) => (
        <div key={post.id}>
          <PostCard
            post={post}
            onLike={onLike}
            onSave={onSave}
            onFollow={onFollow}
            followState={followStates[post.id] || "follow"}
          />
          {/* Insert profile cards after every 2 posts */}
          {(index + 1) % 2 === 0 && (
            <div className="my-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                Pessoas que você pode conhecer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileCards.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
