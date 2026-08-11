<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useOrdersStore } from '@/stores/orders-store'
import { useRestaurantsStore } from '@/stores/restaurants-store'

const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const restaurantsStore = useRestaurantsStore()

const myOrders = computed(() => {
  if (!authStore.userId) {
    return []
  }
  return ordersStore.orders.filter((order) => order.userId === authStore.userId)
})

onMounted(() => {
  void Promise.all([ordersStore.loadOrders(), restaurantsStore.loadRestaurants()])
})
</script>

<template>
  <main class="page">
    <h1>My orders</h1>
    <p v-if="ordersStore.error" class="error">{{ ordersStore.error }}</p>
    <p v-else-if="ordersStore.loading">Loading orders...</p>

    <section v-if="myOrders.length" class="orders-list">
      <RouterLink v-for="order in myOrders" :key="order.id" class="order-card" :to="`/orders/${order.id}`">
        <div>
          <strong>{{ restaurantsStore.restaurantNameById(order.restaurantId) }}</strong>
          <p>Pickup {{ new Date(order.pickupTime).toLocaleString() }}</p>
        </div>
        <div>
          <span>{{ order.orderStatus || 'Unknown' }}</span>
          <strong>${{ order.totalPrice.toFixed(2) }}</strong>
        </div>
      </RouterLink>
    </section>

    <section v-else-if="!ordersStore.loading" class="empty">
      <h2>No orders yet</h2>
      <p v-if="!authStore.userId">Could not read your user id from the JWT token.</p>
      <p v-else>Your pickup orders will show up here.</p>
      <RouterLink to="/restaurants">Browse restaurants</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

.orders-list {
  display: grid;
  gap: 0.7rem;
}

.order-card,
.empty {
  border: 1px solid #d8dfd8;
  border-radius: 18px;
  background: #fff;
  padding: 1rem;
}

.order-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: #12201a;
  text-decoration: none;
}

.order-card p {
  margin: 0.2rem 0 0;
  color: #66756f;
}

.order-card span {
  display: block;
  color: #7a3d13;
  font-weight: 700;
}

.empty a {
  color: #164e3f;
  font-weight: 700;
}

.error {
  color: #a61b1b;
}
</style>
