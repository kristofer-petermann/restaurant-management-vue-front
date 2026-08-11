import { defineStore } from 'pinia'
import { parseApiError } from '@/services/api-error'
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
} from '@/services/menu-items-service'
import type { MenuItem, MenuItemCreate, MenuItemUpdate } from '@/types/menu'

function normalizeString(value: string | null | undefined): string {
  return typeof value === 'string' ? value : ''
}

interface MenuItemsState {
  items: MenuItem[]
  loading: boolean
  error: string | null
}

export const useMenuItemsStore = defineStore('menu-items-store', {
  state: (): MenuItemsState => ({
    items: [],
    loading: false,
    error: null,
  }),

  getters: {
    availableItems: (state): MenuItem[] => state.items.filter((item) => item.isAvailable),
    unavailableItems: (state): MenuItem[] => state.items.filter((item) => !item.isAvailable),
  },

  actions: {
    clearError(): void {
      this.error = null
    },

    async loadItems(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.items = await getMenuItems()
      } catch (error: any) {
        this.error = parseApiError(error) || 'Failed to load menu items.'
      } finally {
        this.loading = false
      }
    },

    async addItem(model: MenuItemCreate): Promise<boolean> {
      this.error = null
      try {
        const created = await createMenuItem(model)
        this.items.push(created)
        return true
      } catch (error: any) {
        this.error = parseApiError(error) || 'Failed to create menu item.'
        return false
      }
    },

    async editItem(model: MenuItemUpdate): Promise<boolean> {
      this.error = null
      try {
        await updateMenuItem(model)
        const idx = this.items.findIndex((item) => item.id === model.id)
        if (idx >= 0) {
          this.items[idx] = {
            id: model.id,
            menuCategoryId: model.menuCategoryId,
            name: model.name,
            description: model.description,
            price: model.price,
            isAvailable: model.isAvailable,
            imageUrl: model.imageUrl,
            summary: model.summary,
          }
        }
        return true
      } catch (error: any) {
        this.error = parseApiError(error) || 'Failed to update menu item.'
        return false
      }
    },

    async removeItem(id: string): Promise<boolean> {
      this.error = null
      try {
        await deleteMenuItem(id)
        this.items = this.items.filter((item) => item.id !== id)
        return true
      } catch (error: any) {
        this.error = parseApiError(error) || 'Failed to delete menu item.'
        return false
      }
    },

    async createItemWithValidation(input: {
      menuCategoryId: string
      name: string | null | undefined
      description: string | null | undefined
      price: number
      isAvailable: boolean
      imageUrl: string | null | undefined
      summary: string | null | undefined
    }): Promise<boolean> {
      const name = normalizeString(input.name)
      const description = normalizeString(input.description)
      const imageUrl = normalizeString(input.imageUrl)
      const summary = normalizeString(input.summary)

      if (!input.menuCategoryId || !name.trim()) {
        this.error = 'Category and item name are required.'
        return false
      }
      if (Number(input.price) < 0) {
        this.error = 'Price must be zero or greater.'
        return false
      }

      return this.addItem({
        menuCategoryId: input.menuCategoryId,
        name: name.trim(),
        description: description.trim(),
        price: Number(input.price),
        isAvailable: input.isAvailable,
        imageUrl: imageUrl.trim(),
        summary: summary.trim(),
      })
    },

    async updateItemWithValidation(input: {
      id: string
      menuCategoryId: string
      name: string | null | undefined
      description: string | null | undefined
      price: number
      isAvailable: boolean
      imageUrl: string | null | undefined
      summary: string | null | undefined
    }): Promise<boolean> {
      const name = normalizeString(input.name)
      const description = normalizeString(input.description)
      const imageUrl = normalizeString(input.imageUrl)
      const summary = normalizeString(input.summary)

      if (!input.menuCategoryId || !name.trim()) {
        this.error = 'Category and item name are required.'
        return false
      }
      if (Number(input.price) < 0) {
        this.error = 'Price must be zero or greater.'
        return false
      }

      return this.editItem({
        id: input.id,
        menuCategoryId: input.menuCategoryId,
        name: name.trim(),
        description: description.trim(),
        price: Number(input.price),
        isAvailable: input.isAvailable,
        imageUrl: imageUrl.trim(),
        summary: summary.trim(),
      })
    },
  },
})
