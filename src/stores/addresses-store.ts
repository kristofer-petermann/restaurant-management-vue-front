import { defineStore } from 'pinia'
import { createAddress, deleteAddress, getAddresses, updateAddress } from '@/services/addresses-service'
import { parseApiError } from '@/services/api-error'
import type { Address, AddressCreate, AddressUpdate } from '@/types/address'

interface AddressesState {
  addresses: Address[]
  loading: boolean
  error: string | null
}

export const useAddressesStore = defineStore('addresses-store', {
  state: (): AddressesState => ({
    addresses: [],
    loading: false,
    error: null,
  }),

  getters: {
    addressesForUser: (state) => (userId: string): Address[] =>
      state.addresses.filter((address) => address.userId === userId),
    addressesForRestaurant: (state) => (restaurantId: string): Address[] =>
      state.addresses.filter((address) => address.restaurantId === restaurantId),
  },

  actions: {
    clearError(): void {
      this.error = null
    },

    async loadAddresses(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.addresses = await getAddresses()
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to load addresses.'
      } finally {
        this.loading = false
      }
    },

    async addAddress(model: AddressCreate): Promise<boolean> {
      this.error = null
      try {
        const created = await createAddress(model)
        this.addresses.push(created)
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to create address.'
        return false
      }
    },

    async editAddress(model: AddressUpdate): Promise<boolean> {
      this.error = null
      try {
        await updateAddress(model)
        const idx = this.addresses.findIndex((address) => address.id === model.id)
        if (idx >= 0) {
          this.addresses[idx] = { ...model }
        }
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to update address.'
        return false
      }
    },

    async removeAddress(id: string): Promise<boolean> {
      this.error = null
      try {
        await deleteAddress(id)
        this.addresses = this.addresses.filter((address) => address.id !== id)
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to delete address.'
        return false
      }
    },
  },
})
