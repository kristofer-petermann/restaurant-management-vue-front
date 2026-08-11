import { defineStore } from 'pinia'
import {
  createRestaurant,
  deleteRestaurant,
  getRestaurants,
  updateRestaurant,
} from '@/services/restaurants-service'
import { parseApiError } from '@/services/api-error'
import type { Restaurant, RestaurantCreate, RestaurantUpdate } from '@/types/restaurant'

interface RestaurantsState {
  restaurants: Restaurant[]
  loading: boolean
  error: string | null
}

export const useRestaurantsStore = defineStore('restaurants-store', {
  state: (): RestaurantsState => ({
    restaurants: [],
    loading: false,
    error: null,
  }),

  getters: {
    restaurantById: (state) => (id: string): Restaurant | undefined =>
      state.restaurants.find((restaurant) => restaurant.id === id),
    restaurantNameById: (state) => (id: string): string =>
      state.restaurants.find((restaurant) => restaurant.id === id)?.restaurantName ?? 'Unknown restaurant',
  },

  actions: {
    clearError(): void {
      this.error = null
    },

    async loadRestaurants(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.restaurants = await getRestaurants()
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to load restaurants.'
      } finally {
        this.loading = false
      }
    },

    async addRestaurant(model: RestaurantCreate): Promise<boolean> {
      this.error = null
      try {
        const created = await createRestaurant(model)
        this.restaurants.push(created)
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to create restaurant.'
        return false
      }
    },

    async editRestaurant(model: RestaurantUpdate): Promise<boolean> {
      this.error = null
      try {
        await updateRestaurant(model)
        const idx = this.restaurants.findIndex((restaurant) => restaurant.id === model.id)
        if (idx >= 0) {
          this.restaurants[idx] = { ...model }
        }
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to update restaurant.'
        return false
      }
    },

    async removeRestaurant(id: string): Promise<boolean> {
      this.error = null
      try {
        await deleteRestaurant(id)
        this.restaurants = this.restaurants.filter((restaurant) => restaurant.id !== id)
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to delete restaurant.'
        return false
      }
    },
  },
})
