import { apiClient } from './api-client'
import type { Order, OrderCreate, OrderUpdate } from '@/types/order'

const basePath = '/api/Orders'

export async function getOrders(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>(basePath)
  return response.data
}

export async function getOrder(id: string): Promise<Order> {
  const response = await apiClient.get<Order>(`${basePath}/${id}`)
  return response.data
}

export async function createOrder(model: OrderCreate): Promise<Order> {
  const response = await apiClient.post<Order>(basePath, model)
  return response.data
}

export async function updateOrder(model: OrderUpdate): Promise<void> {
  await apiClient.put(`${basePath}/${model.id}`, model)
}

export async function deleteOrder(id: string): Promise<void> {
  await apiClient.delete(`${basePath}/${id}`)
}
