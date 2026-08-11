import { defineStore } from 'pinia'
import { parseApiError } from '@/services/api-error'
import {
  createMenuCategory,
  deleteMenuCategory,
  getMenuCategories,
  updateMenuCategory,
} from '@/services/menu-categories-service'
import type { MenuCategory, MenuCategoryCreate, MenuCategoryUpdate } from '@/types/menu'

interface MenuCategoriesState {
  categories: MenuCategory[]
  loading: boolean
  error: string | null
}

export const useMenuCategoriesStore = defineStore('menu-categories-store', {
  state: (): MenuCategoriesState => ({
    categories: [],
    loading: false,
    error: null,
  }),

  getters: {
    categoryNameById: (state) => (id: string): string =>
      state.categories.find((item) => item.id === id)?.name ?? 'Unknown category',
  },

  actions: {
    clearError(): void {
      this.error = null
    },

    async loadCategories(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.categories = await getMenuCategories()
      } catch (error: any) {
        this.error = parseApiError(error) || 'Failed to load menu categories.'
      } finally {
        this.loading = false
      }
    },

    async addCategory(model: MenuCategoryCreate): Promise<boolean> {
      this.error = null
      try {
        const created = await createMenuCategory(model)
        this.categories.push(created)
        return true
      } catch (error: any) {
        this.error = parseApiError(error) || 'Failed to create menu category.'
        return false
      }
    },

    async editCategory(model: MenuCategoryUpdate): Promise<boolean> {
      this.error = null
      try {
        await updateMenuCategory(model)
        const idx = this.categories.findIndex((item) => item.id === model.id)
        if (idx >= 0) {
          this.categories[idx] = {
            id: model.id,
            menuId: model.menuId,
            name: model.name,
            summary: model.summary,
          }
        }
        return true
      } catch (error: any) {
        this.error = parseApiError(error) || 'Failed to update menu category.'
        return false
      }
    },

    async removeCategory(id: string): Promise<boolean> {
      this.error = null
      try {
        await deleteMenuCategory(id)
        this.categories = this.categories.filter((item) => item.id !== id)
        return true
      } catch (error: any) {
        this.error = parseApiError(error) || 'Failed to delete menu category.'
        return false
      }
    },

    async createCategoryWithValidation(input: {
      menuId: string
      name: string
      summary: string
    }): Promise<boolean> {
      if (!input.menuId || !input.name.trim()) {
        this.error = 'Menu and category name are required.'
        return false
      }

      return this.addCategory({
        menuId: input.menuId,
        name: input.name.trim(),
        summary: input.summary.trim(),
      })
    },

    async updateCategoryWithValidation(input: {
      id: string
      menuId: string
      name: string
      summary: string
    }): Promise<boolean> {
      if (!input.menuId || !input.name.trim()) {
        this.error = 'Menu and category name are required.'
        return false
      }

      return this.editCategory({
        id: input.id,
        menuId: input.menuId,
        name: input.name.trim(),
        summary: input.summary.trim(),
      })
    },
  },
})
