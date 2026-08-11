<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { useRestaurantsStore } from '@/stores/restaurants-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'

const authStore = useAuthStore()
const cartStore = useCartStore()
const restaurantsStore = useRestaurantsStore()
const restaurantUsersStore = useRestaurantUsersStore()
const restaurantName = computed(() =>
  cartStore.restaurantId ? restaurantsStore.restaurantNameById(cartStore.restaurantId) : 'No restaurant selected',
)
const isRestaurantAdmin = computed(() =>
  authStore.userId ? restaurantUsersStore.hasAnyRestaurantAdminRights(authStore.userId) : false,
)
const orderingBlocked = computed(() => !authStore.isRoot && isRestaurantAdmin.value)

onMounted(() => {
  void restaurantUsersStore.loadRestaurantUsers()
})
</script>

<template>
  <main class="page">
    <header class="header-row">
      <div>
        <h1>Your cart</h1>
        <p>{{ restaurantName }}</p>
      </div>
      <RouterLink v-if="!orderingBlocked" to="/restaurants">Add more food</RouterLink>
    </header>

    <p v-if="orderingBlocked" class="error">Ordering is disabled for restaurant administrators.</p>

    <section v-if="!orderingBlocked && cartStore.lines.length" class="panel">
      <article v-for="line in cartStore.lines" :key="line.menuItem.id" class="cart-line">
        <div>
          <strong>{{ line.menuItem.name }}</strong>
          <p>${{ line.menuItem.price.toFixed(2) }} each</p>
        </div>
        <input
          :value="line.quantity"
          type="number"
          min="1"
          @input="cartStore.updateQuantity(line.menuItem.id, Number(($event.target as HTMLInputElement).value))"
        />
        <strong>${{ (line.quantity * line.menuItem.price).toFixed(2) }}</strong>
        <button type="button" @click="cartStore.removeItem(line.menuItem.id)">Remove</button>
      </article>

      <footer class="total-row">
        <span>Total</span>
        <strong>${{ cartStore.totalPrice.toFixed(2) }}</strong>
      </footer>

      <RouterLink class="checkout" to="/checkout">Continue to checkout</RouterLink>
    </section>

    <section v-else-if="!orderingBlocked" class="empty">
      <h2>Your cart is empty</h2>
      <p>Pick a restaurant and add some menu items to get started.</p>
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

.header-row,
.cart-line,
.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-row a,
.checkout,
.empty a {
  border-radius: 999px;
  background: #164e3f;
  color: #fff;
  padding: 0.55rem 0.85rem;
  text-decoration: none;
}

.panel,
.empty {
  border: 1px solid #d8dfd8;
  border-radius: 22px;
  background: #fff;
  padding: 1rem;
}

.cart-line {
  border-bottom: 1px solid #e5e7eb;
  padding: 0.8rem 0;
}

.cart-line p,
.header-row p {
  margin: 0.2rem 0 0;
  color: #66756f;
}

input {
  width: 80px;
  border: 1px solid #b8c0cc;
  border-radius: 10px;
  padding: 0.45rem;
}

button {
  border: 1px solid #b91c1c;
  border-radius: 999px;
  background: #fff;
  color: #b91c1c;
  padding: 0.4rem 0.7rem;
  cursor: pointer;
}

.total-row {
  padding: 1rem 0;
  font-size: 1.25rem;
}

.checkout {
  display: inline-flex;
}

@media (max-width: 680px) {
  .cart-line,
  .header-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
