import { apiClient } from './api-client'
import type { Review, ReviewCreate, ReviewUpdate } from '@/types/review'

const basePath = '/api/Reviews'

export async function getReviews(): Promise<Review[]> {
  const response = await apiClient.get<Review[]>(basePath)
  return response.data
}

export async function getReview(id: string): Promise<Review> {
  const response = await apiClient.get<Review>(`${basePath}/${id}`)
  return response.data
}

export async function createReview(model: ReviewCreate): Promise<Review> {
  const response = await apiClient.post<Review>(basePath, model)
  return response.data
}

export async function updateReview(model: ReviewUpdate): Promise<void> {
  await apiClient.put(`${basePath}/${model.id}`, model)
}

export async function deleteReview(id: string): Promise<void> {
  await apiClient.delete(`${basePath}/${id}`)
}
