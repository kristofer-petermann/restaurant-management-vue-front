import { defineStore } from 'pinia'
import {
  createRestaurantUser,
  deleteRestaurantUser,
  getRestaurantUsers,
  updateRestaurantUser,
} from '@/services/restaurant-users-service'
import { parseApiError } from '@/services/api-error'
import { RESTAURANT_USER_ROLE } from '@/types/permissions'
import type { RestaurantUser, RestaurantUserCreate, RestaurantUserUpdate } from '@/types/restaurant-user'

interface RestaurantUsersState {
  restaurantUsers: RestaurantUser[]
  loading: boolean
  error: string | null
}

export const useRestaurantUsersStore = defineStore('restaurant-users-store', {
  state: (): RestaurantUsersState => ({
    restaurantUsers: [],
    loading: false,
    error: null,
  }),

  getters: {
    linksForUser: (state) => (userId: string): RestaurantUser[] =>
      state.restaurantUsers.filter((link) => link.userId === userId),
    restaurantIdsForUser: (state) => (userId: string): string[] =>
      state.restaurantUsers
        .filter((link) => link.userId === userId)
        .map((link) => link.restaurantId),
    adminRestaurantIds: (state) => (userId: string): string[] =>
      state.restaurantUsers
        .filter((link) => link.userId === userId && link.userRole === RESTAURANT_USER_ROLE.admin)
        .map((link) => link.restaurantId),
    normalRestaurantIds: (state) => (userId: string): string[] =>
      state.restaurantUsers
        .filter((link) => link.userId === userId && link.userRole === RESTAURANT_USER_ROLE.normal)
        .map((link) => link.restaurantId),
    isRestaurantAdminOf: (state) => (userId: string, restaurantId: string): boolean =>
      state.restaurantUsers.some(
        (link) =>
          link.userId === userId &&
          link.restaurantId === restaurantId &&
          link.userRole === RESTAURANT_USER_ROLE.admin,
      ),
    hasAnyRestaurantAdminRights: (state) => (userId: string): boolean =>
      state.restaurantUsers.some(
        (link) => link.userId === userId && link.userRole === RESTAURANT_USER_ROLE.admin,
      ),
  },

  actions: {
    clearError(): void {
      this.error = null
    },

    async loadRestaurantUsers(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.restaurantUsers = await getRestaurantUsers()
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to load restaurant users.'
      } finally {
        this.loading = false
      }
    },

    async addRestaurantUser(model: RestaurantUserCreate): Promise<boolean> {
      this.error = null
      try {
        const created = await createRestaurantUser(model)
        this.restaurantUsers.push(created)
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to create restaurant membership.'
        return false
      }
    },

    async addNormalMembership(model: Omit<RestaurantUserCreate, 'userRole' | 'role'>): Promise<boolean> {
      return this.addRestaurantUser({
        ...model,
        userRole: RESTAURANT_USER_ROLE.normal,
        role: 'user',
      })
    },

    async editRestaurantUser(model: RestaurantUserUpdate): Promise<boolean> {
      this.error = null
      try {
        await updateRestaurantUser(model)
        const idx = this.restaurantUsers.findIndex((link) => link.id === model.id)
        if (idx >= 0) {
          this.restaurantUsers[idx] = { ...model }
        }
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to update restaurant membership.'
        return false
      }
    },

    async removeRestaurantUser(id: string): Promise<boolean> {
      this.error = null
      try {
        await deleteRestaurantUser(id)
        this.restaurantUsers = this.restaurantUsers.filter((link) => link.id !== id)
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to delete restaurant membership.'
        return false
      }
    },
  },
})
