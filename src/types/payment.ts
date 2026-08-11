export const PAYMENT_STATUS = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
} as const

export interface Payment {
  id: string
  orderId: string
  amount: number
  paymentStatus: string | null
  paymentMethod: string | null
  paidAt: string | null
  summary: string | null
}

export interface PaymentCreate {
  orderId: string
  amount: number
  paymentStatus: string | null
  paymentMethod: string | null
  paidAt: string | null
  summary: string | null
}

export interface PaymentUpdate extends PaymentCreate {
  id: string
}
