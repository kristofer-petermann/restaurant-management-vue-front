import { apiClient } from './api-client'
import type { Address, AddressCreate, AddressUpdate } from '@/types/address'

const basePath = '/api/Addresses'

export async function getAddresses(): Promise<Address[]> {
  const response = await apiClient.get<Address[]>(basePath)
  return response.data
}

export async function getAddress(id: string): Promise<Address> {
  const response = await apiClient.get<Address>(`${basePath}/${id}`)
  return response.data
}

export async function createAddress(model: AddressCreate): Promise<Address> {
  const response = await apiClient.post<Address>(basePath, model)
  return response.data
}

export async function updateAddress(model: AddressUpdate): Promise<void> {
  await apiClient.put(`${basePath}/${model.id}`, model)
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(`${basePath}/${id}`)
}
