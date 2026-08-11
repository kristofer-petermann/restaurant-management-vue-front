import { defineStore } from 'pinia'
import { createOrder, getOrder, getOrders, updateOrder } from '@/services/orders-service'
import { createOrderRow, getOrderRows } from '@/services/order-rows-service'
import { parseApiError } from '@/services/api-error'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'
import { ORDER_STATUS, type Order, type OrderCreate, type OrderRow, type OrderUpdate } from '@/types/order'
import type { CartLine } from '@/stores/cart-store'

interface OrdersState {
  orders: Order[]
  rows: OrderRow[]
  loading: boolean
  error: string | null
}

export const useOrdersStore = defineStore('orders-store', {
  state: (): OrdersState => ({
    orders: [],
    rows: [],
    loading: false,
    error: null,
  }),

  getters: {
    orderById: (state) => (id: string): Order | undefined => state.orders.find((order) => order.id === id),
    rowsByOrderId: (state) => (orderId: string): OrderRow[] =>
      state.rows.filter((row) => row.orderId === orderId),
  },

  actions: {
    clearError(): void {
      this.error = null
    },

    async loadOrders(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const [orders, rows] = await Promise.all([getOrders(), getOrderRows()])
        this.orders = orders
        this.rows = rows
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to load orders.'
      } finally {
        this.loading = false
      }
    },

    async placeOrder(input: {
      userId: string
      restaurantId: string
      pickupTime: string
      lines: CartLine[]
      totalPrice: number
    }): Promise<Order | null> {
      this.error = null

      if (!input.userId) {
        this.error = 'Could not identify the logged-in user from the token.'
        return null
      }
      if (!input.restaurantId || input.lines.length === 0) {
        this.error = 'Your cart is empty.'
        return null
      }
      if (!input.pickupTime) {
        this.error = 'Please select a pickup time.'
        return null
      }

      // Prevent restaurant admins from placing orders for restaurants they manage
      try {
        const restaurantUsersStore = useRestaurantUsersStore()
        if (restaurantUsersStore.isRestaurantAdminOf(input.userId, input.restaurantId)) {
          this.error = 'Restaurant administrators cannot place orders for their restaurants.'
          return null
        }
      } catch {
        // If store check fails for any reason, continue and let server enforce rules.
      }

      const model: OrderCreate = {
        userId: input.userId,
        restaurantId: input.restaurantId,
        orderStatus: ORDER_STATUS.pending,
        totalPrice: input.totalPrice,
        createdAt: new Date().toISOString(),
        pickupTime: new Date(input.pickupTime).toISOString(),
        summary: `Pickup order with ${input.lines.length} item type(s).`,
      }

      try {
        const order = await createOrder(model)
        const createdRows = await Promise.all(
          input.lines.map((line) =>
            createOrderRow({
              orderId: order.id,
              menuItemId: line.menuItem.id,
              quantity: line.quantity,
              unitPrice: line.menuItem.price,
              summary: line.menuItem.name,
            }),
          ),
        )

        this.orders.unshift(order)
        this.rows.push(...createdRows)
        return order
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to place order.'
        return null
      }
    },

    async changeOrderStatus(order: Order, orderStatus: string): Promise<boolean> {
      this.error = null
      const update: OrderUpdate = { ...order, orderStatus }

      try {
        await updateOrder(update)
        const idx = this.orders.findIndex((item) => item.id === order.id)
        if (idx >= 0) {
          this.orders[idx] = update
        }
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to update order status.'
        return false
      }
    },

    async updatePickupTime(order: Order, pickupTimeLocal: string): Promise<boolean> {
      this.error = null
      const current = await getOrder(order.id)
      const update: OrderUpdate = { ...current, pickupTime: new Date(pickupTimeLocal).toISOString() }

      try {
        await updateOrder(update)
        const idx = this.orders.findIndex((item) => item.id === order.id)
        if (idx >= 0) {
          this.orders[idx] = update
        }
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to update pickup time.'
        return false
      }
    },
  },
})
