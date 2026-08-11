import { defineStore } from 'pinia'
import { createPayment, deletePayment, getPayments, updatePayment } from '@/services/payments-service'
import { parseApiError } from '@/services/api-error'
import type { Payment, PaymentUpdate } from '@/types/payment'

interface PaymentsState {
  payments: Payment[]
  loading: boolean
  error: string | null
}

export const usePaymentsStore = defineStore('payments-store', {
  state: (): PaymentsState => ({
    payments: [],
    loading: false,
    error: null,
  }),

  getters: {
    paymentByOrderId: (state) => (orderId: string): Payment | undefined =>
      state.payments.find((payment) => payment.orderId === orderId),
  },

  actions: {
    clearError(): void {
      this.error = null
    },

    async loadPayments(): Promise<void> {
      this.loading = true
      this.error = null
      try {
        this.payments = await getPayments()
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to load payments.'
      } finally {
        this.loading = false
      }
    },

    async registerPayment(input: {
      orderId: string
      amount: number
      paymentMethod?: string | null
      paymentStatus?: string | null
      paidAt?: string | null
      summary?: string | null
    }): Promise<Payment | null> {
      this.error = null
      try {
        const paidAt = input.paidAt === undefined ? new Date().toISOString() : input.paidAt
        const payment = await createPayment({
          orderId: input.orderId,
          amount: input.amount,
          paymentStatus: input.paymentStatus ?? 'Paid',
          paymentMethod: input.paymentMethod ?? null,
          paidAt,
          summary: input.summary ?? 'Simulated checkout payment registration.',
        })
        this.payments.unshift(payment)
        return payment
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to register payment.'
        return null
      }
    },

    async updatePaymentDetails(input: PaymentUpdate): Promise<boolean> {
      this.error = null
      try {
        await updatePayment(input)
        const idx = this.payments.findIndex((payment) => payment.id === input.id)
        if (idx >= 0) {
          this.payments[idx] = { ...input }
        }
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to update payment.'
        return false
      }
    },

    async removePayment(id: string): Promise<boolean> {
      this.error = null
      try {
        await deletePayment(id)
        this.payments = this.payments.filter((payment) => payment.id !== id)
        return true
      } catch (error) {
        this.error = parseApiError(error) || 'Failed to delete payment.'
        return false
      }
    },
  },
})
