import { apiClient } from './api-client'
import type { Payment, PaymentCreate, PaymentUpdate } from '@/types/payment'

const basePath = '/api/Payments'

export async function getPayments(): Promise<Payment[]> {
  const response = await apiClient.get<Payment[]>(basePath)
  return response.data
}

export async function getPayment(id: string): Promise<Payment> {
  const response = await apiClient.get<Payment>(`${basePath}/${id}`)
  return response.data
}

export async function createPayment(model: PaymentCreate): Promise<Payment> {
  const response = await apiClient.post<Payment>(basePath, model)
  return response.data
}

export async function updatePayment(model: PaymentUpdate): Promise<void> {
  await apiClient.put(`${basePath}/${model.id}`, model)
}

export async function deletePayment(id: string): Promise<void> {
  await apiClient.delete(`${basePath}/${id}`)
}
