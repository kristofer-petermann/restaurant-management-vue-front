<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import { useMenuItemsStore } from '@/stores/menu-items-store'
import { useOrdersStore } from '@/stores/orders-store'
import { usePaymentsStore } from '@/stores/payments-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'
import { useRestaurantsStore } from '@/stores/restaurants-store'
import { ORDER_STATUS, type Order } from '@/types/order'
import { PAYMENT_STATUS, type Payment } from '@/types/payment'

const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const paymentsStore = usePaymentsStore()
const restaurantUsersStore = useRestaurantUsersStore()
const restaurantsStore = useRestaurantsStore()
const itemsStore = useMenuItemsStore()
const paymentSavingId = ref<string | null>(null)
const paymentDrafts = ref<Record<string, PaymentDraft>>({})

const statusOptions = Object.values(ORDER_STATUS)
const managedRestaurantIds = computed(() =>
  authStore.userId ? restaurantUsersStore.adminRestaurantIds(authStore.userId) : [],
)
const visibleOrders = computed(() => {
  if (authStore.isRoot) {
    return ordersStore.orders
  }
  if (!managedRestaurantIds.value.length) {
    return []
  }
  return ordersStore.orders.filter((order) => managedRestaurantIds.value.includes(order.restaurantId))
})
const error = computed(
  () =>
    ordersStore.error ||
    paymentsStore.error ||
    restaurantUsersStore.error ||
    restaurantsStore.error ||
    itemsStore.error,
)

const paymentStatusOptions = Object.values(PAYMENT_STATUS)

interface PaymentDraft {
  amount: number
  paymentStatus: string
  paymentMethod: string
  paidAtLocal: string
  summary: string
}

function rowsTotal(orderId: string): number {
  return ordersStore.rowsByOrderId(orderId).reduce((total, row) => total + row.quantity, 0)
}

function rowSummary(orderId: string): string {
  const rows = ordersStore.rowsByOrderId(orderId)
  if (!rows.length) {
    return 'No rows loaded'
  }

  return rows
    .map((row) => {
      const itemName = itemsStore.items.find((item) => item.id === row.menuItemId)?.name ?? 'Unknown item'
      return `${itemName} x ${row.quantity}`
    })
    .join(', ')
}

function ensurePaymentDraft(order: Order): PaymentDraft {
  const existing = paymentDrafts.value[order.id]
  if (existing) {
    return existing
  }

  const current = paymentsStore.paymentByOrderId(order.id)
  const draft: PaymentDraft = {
    amount: current?.amount ?? order.totalPrice,
    paymentStatus: current?.paymentStatus ?? PAYMENT_STATUS.pending,
    paymentMethod: current?.paymentMethod ?? 'Card',
    paidAtLocal: toLocalDateTimeIso(current?.paidAt ?? new Date().toISOString()),
    summary: current?.summary ?? '',
  }
  paymentDrafts.value[order.id] = draft
  return draft
}

function currentPayment(orderId: string): Payment | undefined {
  return paymentsStore.paymentByOrderId(orderId)
}

async function updateStatus(order: Order, value: string): Promise<void> {
  await ordersStore.changeOrderStatus(order, value)
}

function toLocalDateTimeIso(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function localInputToIso(value: string): string | null {
  if (!value) return null
  return new Date(value).toISOString()
}

async function savePayment(order: Order): Promise<void> {
  const draft = ensurePaymentDraft(order)
  paymentSavingId.value = order.id
  const paidAt = localInputToIso(draft.paidAtLocal)
  const existing = currentPayment(order.id)
  const summary = draft.summary?.trim() ? draft.summary.trim() : null

  if (existing) {
    const updated = await paymentsStore.updatePaymentDetails({
      id: existing.id,
      orderId: order.id,
      amount: draft.amount,
      paymentStatus: draft.paymentStatus,
      paymentMethod: draft.paymentMethod,
      paidAt,
      summary,
    })
    if (updated && draft.paymentStatus === PAYMENT_STATUS.paid) {
      await ordersStore.changeOrderStatus(order, ORDER_STATUS.paid)
    }
  } else {
    const created = await paymentsStore.registerPayment({
      orderId: order.id,
      amount: draft.amount,
      paymentStatus: draft.paymentStatus,
      paymentMethod: draft.paymentMethod,
      paidAt,
      summary,
    })
    if (created && draft.paymentStatus === PAYMENT_STATUS.paid) {
      await ordersStore.changeOrderStatus(order, ORDER_STATUS.paid)
    }
  }
  paymentSavingId.value = null
}

async function onPickupChange(order: Order, value: string): Promise<void> {
  if (!value) return
  await ordersStore.updatePickupTime(order, value)
}

onMounted(() => {
  void Promise.all([
    ordersStore.loadOrders(),
    paymentsStore.loadPayments(),
    restaurantUsersStore.loadRestaurantUsers(),
    restaurantsStore.loadRestaurants(),
    itemsStore.loadItems(),
  ])
})
</script>

<template>
  <main class="page">
    <h1>{{ authStore.isRoot ? 'Admin orders' : 'Manager orders' }}</h1>
    <p class="hint">Managers see only orders for restaurants where they have RestaurantUser Admin rights.</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="ordersStore.loading">Loading orders...</p>

    <section v-if="visibleOrders.length" class="orders-grid">
      <article v-for="order in visibleOrders" :key="order.id" class="order-card">
        <header>
          <div>
            <strong>{{ restaurantsStore.restaurantNameById(order.restaurantId) }}</strong>
            <p>{{ order.id }}</p>
          </div>
          <span>{{ order.orderStatus || 'Unknown' }}</span>
        </header>

        <p>{{ rowSummary(order.id) }}</p>
        <p class="facts">
          {{ rowsTotal(order.id) }} items · ${{ order.totalPrice.toFixed(2) }}
        </p>

        <label>
          Pickup
          <input
            type="datetime-local"
            :value="toLocalDateTimeIso(order.pickupTime)"
            @change="onPickupChange(order, ($event.target as HTMLInputElement).value)"
          />
        </label>

        <label>
          Update status
          <select :value="order.orderStatus || ''" @change="updateStatus(order, ($event.target as HTMLSelectElement).value)">
            <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
          </select>
        </label>

        <section class="payment">
          <p class="section-title">Payment</p>
          <p class="facts" v-if="currentPayment(order.id)">
            {{ currentPayment(order.id)?.paymentStatus || 'Unknown' }} ·
            {{ currentPayment(order.id)?.paymentMethod || 'Unknown method' }} ·
            ${{ currentPayment(order.id)?.amount.toFixed(2) || order.totalPrice.toFixed(2) }}
          </p>

          <label>
            Amount
            <input
              type="number"
              step="0.01"
              min="0"
              v-model.number="ensurePaymentDraft(order).amount"
            />
          </label>

          <label>
            Status
            <select v-model="ensurePaymentDraft(order).paymentStatus">
              <option v-for="status in paymentStatusOptions" :key="status" :value="status">{{ status }}</option>
            </select>
          </label>

          <label>
            Method
            <input v-model="ensurePaymentDraft(order).paymentMethod" placeholder="Card, Cash, Gift" />
          </label>

          <label>
            Paid at
            <input type="datetime-local" v-model="ensurePaymentDraft(order).paidAtLocal" />
          </label>

          <label>
            Summary
            <input v-model="ensurePaymentDraft(order).summary" placeholder="Optional note" />
          </label>

          <div class="payment-actions">
            <button type="button" @click="savePayment(order)" :disabled="paymentSavingId === order.id">
              {{ currentPayment(order.id) ? 'Update' : 'Register payment' }}
            </button>
            
          </div>
        </section>
      </article>
    </section>

    <section v-else-if="!ordersStore.loading" class="empty">
      <h2>No incoming orders</h2>
      <p>New customer orders will appear here.</p>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.5rem;
}

.hint {
  color: #4b5563;
}

.orders-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.order-card,
.empty {
  border: 1px solid #d5d9e2;
  border-radius: 16px;
  background: #fff;
  padding: 1rem;
}

.order-card header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.order-card header p,
.facts {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.order-card span {
  align-self: start;
  border-radius: 999px;
  background: #fff3d6;
  color: #7a3d13;
  padding: 0.2rem 0.55rem;
  font-weight: 700;
}

label {
  display: grid;
  gap: 0.35rem;
  margin-top: 0.8rem;
  font-weight: 700;
}

select,
input {
  border: 1px solid #b8c0cc;
  border-radius: 8px;
  padding: 0.5rem;
  font: inherit;
}

.payment {
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px dashed #e1e6ee;
  display: grid;
  gap: 0.6rem;
}

.section-title {
  margin: 0;
  font-weight: 800;
  color: #1f2937;
}

.payment-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

button {
  border: none;
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  background: #0f766e;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

button.danger {
  background: #b42318;
}

.error {
  color: #a61b1b;
}
</style>
