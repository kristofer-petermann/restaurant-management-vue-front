import { defineStore } from 'pinia'
import {
  createOpeningHour,
  deleteOpeningHour,
  getOpeningHours,
  updateOpeningHour,
} from '@/services/opening-hours-service'
import { parseApiError } from '@/services/api-error'
import type { OpeningHour, OpeningHourCreate, OpeningHourUpdate } from '@/types/opening-hour'

interface OpeningHoursState {
  openingHours: OpeningHour[]
  loading: boolean
  error: string | null
}

export const useOpeningHoursStore = defineStore('opening-hours-store', {
  state: (): OpeningHoursState => ({
    openingHours: [],
    loading: false,
    error: null,
  }),

  getters: {
    hoursForRestaurant: (state) => (restaurantId: string): OpeningHour[] =>
      state.openingHours.filter((item) => item.restaurantId === restaurantId),
  },

  actions: {
    clearError(): void {
      this.error = null
    },

    async loadOpeningHours(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.openingHours = await getOpeningHours()
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to load opening hours.'
      } finally {
        this.loading = false
      }
    },

    async addOpeningHour(model: OpeningHourCreate): Promise<boolean> {
      this.error = null
      try {
        const created = await createOpeningHour(model)
        this.openingHours.push(created)
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to create opening hour.'
        return false
      }
    },

    async editOpeningHour(model: OpeningHourUpdate): Promise<boolean> {
      this.error = null
      try {
        await updateOpeningHour(model)
        const idx = this.openingHours.findIndex((item) => item.id === model.id)
        if (idx >= 0) {
          this.openingHours[idx] = { ...model }
        }
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to update opening hour.'
        return false
      }
    },

    async removeOpeningHour(id: string): Promise<boolean> {
      this.error = null
      try {
        await deleteOpeningHour(id)
        this.openingHours = this.openingHours.filter((item) => item.id !== id)
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to delete opening hour.'
        return false
      }
    },
  },
})
