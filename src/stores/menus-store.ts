import { defineStore } from 'pinia'
import { parseApiError } from '@/services/api-error'
import { createMenu, deleteMenu, getMenus, updateMenu } from '@/services/menus-service'
import type { Menu, MenuCreate, MenuUpdate } from '@/types/menu'

interface MenusState {
  menus: Menu[]
  loading: boolean
  error: string | null
}

export const useMenusStore = defineStore('menus-store', {
  state: (): MenusState => ({
    menus: [],
    loading: false,
    error: null,
  }),

  getters: {
    activeMenus: (state): Menu[] => state.menus.filter((menu) => menu.isActive),
    menuNameById: (state) => (id: string): string =>
      state.menus.find((item) => item.id === id)?.name ?? 'Unknown menu',
  },

  actions: {
    clearError(): void {
      this.error = null
    },

    async loadMenus(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.menus = await getMenus()
      } catch (error: any) {
        this.error = parseApiError(error) || 'Failed to load menus.'
      } finally {
        this.loading = false
      }
    },

    async addMenu(model: MenuCreate): Promise<boolean> {
      this.error = null
      try {
        const created = await createMenu(model)
        this.menus.push(created)
        return true
      } catch (error: any) {
        this.error = parseApiError(error) || 'Failed to create menu.'
        return false
      }
    },

    async editMenu(model: MenuUpdate): Promise<boolean> {
      this.error = null
      try {
        await updateMenu(model)
        const idx = this.menus.findIndex((item) => item.id === model.id)
        if (idx >= 0) {
          this.menus[idx] = {
            id: model.id,
            restaurantId: model.restaurantId,
            name: model.name,
            isActive: model.isActive,
            summary: model.summary,
          }
        }
        return true
      } catch (error: any) {
        this.error = parseApiError(error) || 'Failed to update menu.'
        return false
      }
    },

    async removeMenu(id: string): Promise<boolean> {
      this.error = null
      try {
        await deleteMenu(id)
        this.menus = this.menus.filter((item) => item.id !== id)
        return true
      } catch (error: any) {
        this.error = parseApiError(error) || 'Failed to delete menu.'
        return false
      }
    },

    async createMenuWithValidation(input: {
      restaurantId: string
      name: string
      isActive: boolean
      summary: string
    }): Promise<boolean> {
      if (!input.restaurantId || !input.name.trim()) {
        this.error = 'Restaurant and menu name are required.'
        return false
      }

      return this.addMenu({
        restaurantId: input.restaurantId,
        name: input.name.trim(),
        isActive: input.isActive,
        summary: input.summary.trim(),
      })
    },

    async updateMenuWithValidation(input: {
      id: string
      restaurantId: string
      name: string
      isActive: boolean
      summary: string
    }): Promise<boolean> {
      if (!input.restaurantId || !input.name.trim()) {
        this.error = 'Restaurant and menu name are required.'
        return false
      }

      return this.editMenu({
        id: input.id,
        restaurantId: input.restaurantId,
        name: input.name.trim(),
        isActive: input.isActive,
        summary: input.summary.trim(),
      })
    },
  },
})
