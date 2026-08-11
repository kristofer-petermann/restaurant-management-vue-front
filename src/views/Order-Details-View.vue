<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useMenuItemsStore } from '@/stores/menu-items-store'
import { useOrdersStore } from '@/stores/orders-store'
import { usePaymentsStore } from '@/stores/payments-store'
import { useRestaurantsStore } from '@/stores/restaurants-store'

const route = useRoute()
const orderId = computed(() => String(route.params.id ?? ''))
const ordersStore = useOrdersStore()
const paymentsStore = usePaymentsStore()
const restaurantsStore = useRestaurantsStore()
const itemsStore = useMenuItemsStore()

const order = computed(() => ordersStore.orderById(orderId.value))
const rows = computed(() => ordersStore.rowsByOrderId(orderId.value))
const payment = computed(() => paymentsStore.paymentByOrderId(orderId.value))
const restaurantName = computed(() =>
  order.value ? restaurantsStore.restaurantNameById(order.value.restaurantId) : 'Unknown restaurant',
)

function itemName(menuItemId: string): string {
  return itemsStore.items.find((item) => item.id === menuItemId)?.name ?? 'Unknown item'
}

onMounted(() => {
  void Promise.all([
    ordersStore.loadOrders(),
    paymentsStore.loadPayments(),
    restaurantsStore.loadRestaurants(),
    itemsStore.loadItems(),
  ])
})
</script>

<template>
  <main class="page">
    <RouterLink to="/my-orders">Back to my orders</RouterLink>

    <section v-if="order" class="panel">
      <header>
        <p class="eyebrow">Order {{ order.id }}</p>
        <h1>{{ restaurantName }}</h1>
        <span class="status">{{ order.orderStatus || 'Unknown' }}</span>
      </header>

      <div class="facts">
        <p><strong>Total:</strong> ${{ order.totalPrice.toFixed(2) }}</p>
        <p><strong>Created:</strong> {{ new Date(order.createdAt).toLocaleString() }}</p>
        <p><strong>Pickup:</strong> {{ new Date(order.pickupTime).toLocaleString() }}</p>
        <p><strong>Payment:</strong> {{ payment?.paymentStatus || 'No payment registered' }}</p>
      </div>

      <h2>Items</h2>
      <ul>
        <li v-for="row in rows" :key="row.id">
          <span>{{ itemName(row.menuItemId) }} x {{ row.quantity }}</span>
          <strong>${{ (row.unitPrice * row.quantity).toFixed(2) }}</strong>
        </li>
      </ul>
    </section>

    <section v-else class="panel">
      <h1>Order not found</h1>
      <p v-if="ordersStore.loading">Loading order details...</p>
      <p v-else>The order may not exist or may not be visible for this account.</p>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 850px;
  margin: 0 auto;
  padding: 1.5rem;
}

a {
  color: #164e3f;
  font-weight: 700;
  text-decoration: none;
}

.panel {
  margin-top: 1rem;
  border: 1px solid #d8dfd8;
  border-radius: 22px;
  background: #fff;
  padding: 1rem;
}

.eyebrow {
  color: #66756f;
  font-size: 0.78rem;
  margin: 0;
}

h1 {
  margin: 0.2rem 0;
}

.status {
  display: inline-flex;
  border-radius: 999px;
  background: #fff3d6;
  color: #7a3d13;
  padding: 0.25rem 0.7rem;
  font-weight: 700;
}

.facts {
  display: grid;
  gap: 0.35rem;
  margin: 1rem 0;
}

.facts p {
  margin: 0;
}

ul {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.65rem;
}
</style>
