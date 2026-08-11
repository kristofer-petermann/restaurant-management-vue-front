import { defineStore } from 'pinia'
import type { MenuItem } from '@/types/menu'

export interface CartLine {
  menuItem: MenuItem
  quantity: number
}

interface CartState {
  restaurantId: string | null
  lines: CartLine[]
  pickupTime: string
}

export const useCartStore = defineStore('cart-store', {
  state: (): CartState => ({
    restaurantId: null,
    lines: [],
    pickupTime: '',
  }),

  getters: {
    totalItems: (state): number => state.lines.reduce((total, line) => total + line.quantity, 0),
    totalPrice: (state): number =>
      state.lines.reduce((total, line) => total + line.quantity * line.menuItem.price, 0),
  },

  actions: {
    addItem(restaurantId: string, menuItem: MenuItem): void {
      if (this.restaurantId && this.restaurantId !== restaurantId) {
        this.lines = []
      }

      this.restaurantId = restaurantId
      const existing = this.lines.find((line) => line.menuItem.id === menuItem.id)
      if (existing) {
        existing.quantity += 1
        return
      }

      this.lines.push({ menuItem, quantity: 1 })
    },

    updateQuantity(menuItemId: string, quantity: number): void {
      const safeQuantity = Math.max(0, Math.floor(quantity))
      if (safeQuantity === 0) {
        this.removeItem(menuItemId)
        return
      }

      const existing = this.lines.find((line) => line.menuItem.id === menuItemId)
      if (existing) {
        existing.quantity = safeQuantity
      }
    },

    removeItem(menuItemId: string): void {
      this.lines = this.lines.filter((line) => line.menuItem.id !== menuItemId)
      if (this.lines.length === 0) {
        this.restaurantId = null
        this.pickupTime = ''
      }
    },

    setPickupTime(value: string): void {
      this.pickupTime = value
    },

    clearCart(): void {
      this.restaurantId = null
      this.lines = []
      this.pickupTime = ''
    },
  },
})
