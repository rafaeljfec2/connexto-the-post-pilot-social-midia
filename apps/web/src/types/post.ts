export type SocialMedia = 'linkedin' | 'twitter' | 'instagram' | 'facebook'

export type PostStatus = 'pending' | 'scheduled' | 'published' | 'failed'

export interface Post {
  id: string
  content: string
  mediaUrls?: string[]
  socialMedias: SocialMedia[]
  status: PostStatus
  scheduledFor?: Date
  createdAt: Date
  updatedAt: Date
  aiSuggestions?: {
    content: string
    score: number
  }[]
}

export interface PostFilters {
  status?: PostStatus
  socialMedia?: SocialMedia
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
}
