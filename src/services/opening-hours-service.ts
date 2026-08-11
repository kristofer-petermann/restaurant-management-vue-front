import { apiClient } from './api-client'
import type { OpeningHour, OpeningHourCreate, OpeningHourUpdate } from '@/types/opening-hour'

const basePath = '/api/OpeningHours'

export async function getOpeningHours(): Promise<OpeningHour[]> {
  const response = await apiClient.get<OpeningHour[]>(basePath)
  return response.data
}

export async function getOpeningHour(id: string): Promise<OpeningHour> {
  const response = await apiClient.get<OpeningHour>(`${basePath}/${id}`)
  return response.data
}

export async function createOpeningHour(model: OpeningHourCreate): Promise<OpeningHour> {
  const response = await apiClient.post<OpeningHour>(basePath, model)
  return response.data
}

export async function updateOpeningHour(model: OpeningHourUpdate): Promise<void> {
  await apiClient.put(`${basePath}/${model.id}`, model)
}

export async function deleteOpeningHour(id: string): Promise<void> {
  await apiClient.delete(`${basePath}/${id}`)
}
