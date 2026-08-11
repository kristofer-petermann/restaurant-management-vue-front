import { apiClient } from './api-client'
import type { Restaurant, RestaurantCreate, RestaurantUpdate } from '@/types/restaurant'

const basePath = '/api/Restaurants'

export async function getRestaurants(): Promise<Restaurant[]> {
  const response = await apiClient.get<Restaurant[]>(basePath)
  return response.data
}

export async function getRestaurant(id: string): Promise<Restaurant> {
  const response = await apiClient.get<Restaurant>(`${basePath}/${id}`)
  return response.data
}

export async function createRestaurant(model: RestaurantCreate): Promise<Restaurant> {
  const response = await apiClient.post<Restaurant>(basePath, model)
  return response.data
}

export async function updateRestaurant(model: RestaurantUpdate): Promise<void> {
  await apiClient.put(`${basePath}/${model.id}`, model)
}

export async function deleteRestaurant(id: string): Promise<void> {
  await apiClient.delete(`${basePath}/${id}`)
}
