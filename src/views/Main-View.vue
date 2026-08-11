<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'

const authStore = useAuthStore()
const restaurantUsersStore = useRestaurantUsersStore()
const isRestaurantAdmin = computed(() =>
  authStore.userId ? restaurantUsersStore.hasAnyRestaurantAdminRights(authStore.userId) : false,
)

onMounted(() => {
  void restaurantUsersStore.loadRestaurantUsers()
})
</script>

<template>
  <main class="home-page">
    <section class="hero">
      <div>
        <p class="eyebrow">Clean Onion Resto</p>
        <h1 v-if="isRestaurantAdmin && !authStore.isRoot">Manage your restaurants with clarity.</h1>
        <h1 v-else>Order pickup without the dashboard clutter.</h1>
        <p v-if="isRestaurantAdmin && !authStore.isRoot">Manage menus, orders, and opening hours for your restaurants.</p>
        <p v-else>Browse restaurants, build a cart, and keep track of your orders.</p>
      </div>
      <div class="hero-actions">
        <template v-if="isRestaurantAdmin && !authStore.isRoot">
          <RouterLink to="/manager/restaurants">Manage restaurants</RouterLink>
          <RouterLink to="/manager/orders">Manage orders</RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/restaurants">Browse restaurants</RouterLink>
          <RouterLink to="/my-orders">My orders</RouterLink>
        </template>
      </div>
    </section>

    <section class="cards">
      <article v-if="!isRestaurantAdmin || authStore.isRoot" class="panel">
        <h2>Customer</h2>
        <p>Find a restaurant, view menus and opening hours, add items, and checkout.</p>
        <RouterLink to="/restaurants">Start ordering</RouterLink>
      </article>

      <article v-if="isRestaurantAdmin && !authStore.isRoot" class="panel">
        <h2>Restaurant manager</h2>
        <p>Manage only the restaurants where you have restaurant-admin rights.</p>
        <RouterLink to="/manager/restaurants">Open manager area</RouterLink>
      </article>

      <article v-if="authStore.isRoot" class="panel">
        <h2>Root admin</h2>
        <p>Open the root-only administration area.</p>
        <RouterLink to="/admin/restaurants">Open admin area</RouterLink>
      </article>
    </section>
  </main>
</template>

<style scoped>
.home-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 1.2rem;
  border-radius: 28px;
  padding: 2rem;
  color: #fff;
  background:
    radial-gradient(circle at top right, rgba(255, 202, 128, 0.8), transparent 30%),
    linear-gradient(135deg, #164e3f, #102a43);
}

.eyebrow {
  margin: 0 0 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 800;
  font-size: 0.78rem;
}

.hero h1 {
  margin: 0;
  max-width: 720px;
  font-size: clamp(2rem, 5vw, 4rem);
}

.hero p:last-child {
  max-width: 650px;
  color: #e7f3ef;
}

.hero-actions {
  display: grid;
  align-content: center;
  gap: 0.7rem;
  min-width: 210px;
}

.hero-actions a,
.panel a {
  border-radius: 999px;
  background: #fff3d6;
  color: #5b330e;
  padding: 0.6rem 0.9rem;
  text-decoration: none;
  font-weight: 800;
  text-align: center;
}

.cards {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.panel {
  border: 1px solid #d5d9e2;
  border-radius: 18px;
  background: #fff;
  padding: 1rem;
}

.panel h2 {
  margin: 0;
}

.panel p {
  color: #4b5563;
}

@media (max-width: 780px) {
  .hero {
    flex-direction: column;
  }
}
</style>
