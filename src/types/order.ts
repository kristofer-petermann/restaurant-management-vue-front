export const ORDER_STATUS = {
  pending: 'Pending',
  paid: 'Paid',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export interface Order {
  id: string
  userId: string
  restaurantId: string
  orderStatus: string | null
  totalPrice: number
  createdAt: string
  pickupTime: string
  summary: string | null
}

export interface OrderCreate {
  userId: string
  restaurantId: string
  orderStatus: string | null
  totalPrice: number
  createdAt: string
  pickupTime: string
  summary: string | null
}

export interface OrderUpdate extends OrderCreate {
  id: string
}

export interface OrderRow {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  unitPrice: number
  summary: string | null
}

export interface OrderRowCreate {
  orderId: string
  menuItemId: string
  quantity: number
  unitPrice: number
  summary: string | null
}

export interface OrderRowUpdate extends OrderRowCreate {
  id: string
}
