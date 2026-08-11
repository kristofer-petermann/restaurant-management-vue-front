export interface Review {
  id: string
  userId: string
  restaurantId: string
  rating: number
  comment: string | null
  createdAt: string
  summary: string | null
}

export interface ReviewCreate {
  userId: string
  restaurantId: string
  rating: number
  comment: string | null
  createdAt: string
  summary: string | null
}

export interface ReviewUpdate extends ReviewCreate {
  id: string
}
