import { defineStore } from 'pinia'
import { createReview, deleteReview, getReviews, updateReview } from '@/services/reviews-service'
import { parseApiError } from '@/services/api-error'
import type { Review, ReviewCreate, ReviewUpdate } from '@/types/review'

interface ReviewsState {
  reviews: Review[]
  loading: boolean
  error: string | null
}

export const useReviewsStore = defineStore('reviews-store', {
  state: (): ReviewsState => ({
    reviews: [],
    loading: false,
    error: null,
  }),

  getters: {
    reviewsForRestaurant: (state) => (restaurantId: string): Review[] =>
      state.reviews.filter((review) => review.restaurantId === restaurantId),
    averageRatingForRestaurant: (state) => (restaurantId: string): number => {
      const reviews = state.reviews.filter((review) => review.restaurantId === restaurantId)
      if (!reviews.length) {
        return 0
      }
      return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    },
  },

  actions: {
    clearError(): void {
      this.error = null
    },

    async loadReviews(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.reviews = await getReviews()
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to load reviews.'
      } finally {
        this.loading = false
      }
    },

    async addReview(model: ReviewCreate): Promise<boolean> {
      this.error = null
      try {
        const created = await createReview(model)
        this.reviews.unshift(created)
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to create review.'
        return false
      }
    },

    async editReview(model: ReviewUpdate): Promise<boolean> {
      this.error = null
      try {
        await updateReview(model)
        const idx = this.reviews.findIndex((review) => review.id === model.id)
        if (idx >= 0) {
          this.reviews[idx] = { ...model }
        }
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to update review.'
        return false
      }
    },

    async removeReview(id: string): Promise<boolean> {
      this.error = null
      try {
        await deleteReview(id)
        this.reviews = this.reviews.filter((review) => review.id !== id)
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to delete review.'
        return false
      }
    },
  },
})
