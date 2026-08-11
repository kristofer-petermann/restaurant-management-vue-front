import { apiClient } from './api-client'
import type { MenuCategory, MenuCategoryCreate, MenuCategoryUpdate } from '@/types/menu'

const basePath = '/api/MenuCategories'

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const response = await apiClient.get<MenuCategory[]>(basePath)
  return response.data
}

export async function getMenuCategory(id: string): Promise<MenuCategory> {
  const response = await apiClient.get<MenuCategory>(`${basePath}/${id}`)
  return response.data
}

export async function createMenuCategory(model: MenuCategoryCreate): Promise<MenuCategory> {
  const response = await apiClient.post<MenuCategory>(basePath, model)
  return response.data
}

export async function updateMenuCategory(model: MenuCategoryUpdate): Promise<void> {
  await apiClient.put(`${basePath}/${model.id}`, model)
}

export async function deleteMenuCategory(id: string): Promise<void> {
  await apiClient.delete(`${basePath}/${id}`)
}
