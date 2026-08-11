import { apiClient } from './api-client'
import type { MenuItem, MenuItemCreate, MenuItemUpdate } from '@/types/menu'

const basePath = '/api/MenuItems'

export async function getMenuItems(): Promise<MenuItem[]> {
  const response = await apiClient.get<MenuItem[]>(basePath)
  return response.data
}

export async function getMenuItem(id: string): Promise<MenuItem> {
  const response = await apiClient.get<MenuItem>(`${basePath}/${id}`)
  return response.data
}

export async function createMenuItem(model: MenuItemCreate): Promise<MenuItem> {
  const response = await apiClient.post<MenuItem>(basePath, model)
  return response.data
}

export async function updateMenuItem(model: MenuItemUpdate): Promise<void> {
  await apiClient.put(`${basePath}/${model.id}`, model)
}

export async function deleteMenuItem(id: string): Promise<void> {
  await apiClient.delete(`${basePath}/${id}`)
}
