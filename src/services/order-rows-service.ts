import { apiClient } from './api-client'
import type { OrderRow, OrderRowCreate, OrderRowUpdate } from '@/types/order'

const basePath = '/api/OrderRows'

export async function getOrderRows(): Promise<OrderRow[]> {
  const response = await apiClient.get<OrderRow[]>(basePath)
  return response.data
}

export async function getOrderRow(id: string): Promise<OrderRow> {
  const response = await apiClient.get<OrderRow>(`${basePath}/${id}`)
  return response.data
}

export async function createOrderRow(model: OrderRowCreate): Promise<OrderRow> {
  const response = await apiClient.post<OrderRow>(basePath, model)
  return response.data
}

export async function updateOrderRow(model: OrderRowUpdate): Promise<void> {
  await apiClient.put(`${basePath}/${model.id}`, model)
}

export async function deleteOrderRow(id: string): Promise<void> {
  await apiClient.delete(`${basePath}/${id}`)
}
