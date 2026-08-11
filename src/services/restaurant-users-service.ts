import { apiClient } from './api-client'
import type { RestaurantUser, RestaurantUserCreate, RestaurantUserUpdate } from '@/types/restaurant-user'

const basePath = '/api/RestaurantUsers'

export async function getRestaurantUsers(): Promise<RestaurantUser[]> {
  const response = await apiClient.get<RestaurantUser[]>(basePath)
  return response.data
}

export async function getRestaurantUser(id: string): Promise<RestaurantUser> {
  const response = await apiClient.get<RestaurantUser>(`${basePath}/${id}`)
  return response.data
}

export async function createRestaurantUser(model: RestaurantUserCreate): Promise<RestaurantUser> {
  const response = await apiClient.post<RestaurantUser>(basePath, model)
  return response.data
}

export async function updateRestaurantUser(model: RestaurantUserUpdate): Promise<void> {
  await apiClient.put(`${basePath}/${model.id}`, model)
}

export async function deleteRestaurantUser(id: string): Promise<void> {
  await apiClient.delete(`${basePath}/${id}`)
}
