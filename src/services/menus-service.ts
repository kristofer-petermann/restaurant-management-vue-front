import { apiClient } from './api-client'
import type { Menu, MenuCreate, MenuUpdate } from '@/types/menu'

const basePath = '/api/Menus'

export async function getMenus(): Promise<Menu[]> {
  const response = await apiClient.get<Menu[]>(basePath)
  return response.data
}

export async function getMenu(id: string): Promise<Menu> {
  const response = await apiClient.get<Menu>(`${basePath}/${id}`)
  return response.data
}

export async function createMenu(model: MenuCreate): Promise<Menu> {
  const response = await apiClient.post<Menu>(basePath, model)
  return response.data
}

export async function updateMenu(model: MenuUpdate): Promise<void> {
  await apiClient.put(`${basePath}/${model.id}`, model)
}

export async function deleteMenu(id: string): Promise<void> {
  await apiClient.delete(`${basePath}/${id}`)
}
