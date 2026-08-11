<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useRestaurantsStore } from '@/stores/restaurants-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'

const authStore = useAuthStore()
const restaurantsStore = useRestaurantsStore()
const restaurantUsersStore = useRestaurantUsersStore()
const hasRestaurants = computed(() => restaurantsStore.restaurants.length > 0)
const isRestaurantAdmin = computed(() =>
  authStore.userId ? restaurantUsersStore.hasAnyRestaurantAdminRights(authStore.userId) : false,
)
const orderingBlocked = computed(() => !authStore.isRoot && isRestaurantAdmin.value)

onMounted(() => {
  void Promise.all([restaurantsStore.loadRestaurants(), restaurantUsersStore.loadRestaurantUsers()])
})
</script>

<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Pickup ordering</p>
      <h1>Choose a restaurant</h1>
      <p>Browse restaurants, pick your favourites, and build a pickup order in a few clicks.</p>
    </section>

    <p v-if="orderingBlocked" class="error">Ordering is disabled for restaurant administrators.</p>
    <p v-else-if="restaurantsStore.error" class="error">{{ restaurantsStore.error }}</p>
    <p v-else-if="restaurantsStore.loading" class="loading">Loading restaurants...</p>

    <section v-if="!orderingBlocked && hasRestaurants" class="cards">
      <RouterLink
        v-for="restaurant in restaurantsStore.restaurants"
        :key="restaurant.id"
        class="card"
        :to="`/restaurants/${restaurant.id}`"
      >
        <span class="badge">Open for pickup</span>
        <h2>{{ restaurant.restaurantName || 'Unnamed restaurant' }}</h2>
        <p>{{ restaurant.description || restaurant.summary || 'No description yet.' }}</p>
        <small>{{ restaurant.phone || 'No phone' }} · {{ restaurant.email || 'No email' }}</small>
      </RouterLink>
    </section>

    <section v-else-if="!orderingBlocked && !restaurantsStore.loading" class="empty">
      <h2>No restaurants yet</h2>
      <p>Once restaurants are created by an administrator, they will appear here.</p>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 2rem 1.2rem;
}

.hero {
  border-radius: 28px;
  padding: 2rem;
  color: #fff;
  background:
    radial-gradient(circle at top right, rgba(255, 202, 128, 0.85), transparent 34%),
    linear-gradient(135deg, #164e3f 0%, #102a43 100%);
  margin-bottom: 1.4rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
  font-size: 0.78rem;
  margin: 0 0 0.5rem;
}

.hero h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 4rem);
}

.hero p:last-child {
  max-width: 620px;
  color: #e7f3ef;
}

.cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.card {
  display: grid;
  gap: 0.65rem;
  min-height: 210px;
  padding: 1.2rem;
  border: 1px solid #d8dfd8;
  border-radius: 22px;
  color: #12201a;
  text-decoration: none;
  background: linear-gradient(180deg, #fffaf0, #ffffff);
  box-shadow: 0 18px 45px rgba(20, 63, 52, 0.08);
}

.card h2,
.card p {
  margin: 0;
}

.card small {
  align-self: end;
  color: #62736c;
}

.badge {
  width: fit-content;
  border-radius: 999px;
  padding: 0.22rem 0.62rem;
  background: #dff5d8;
  color: #23651e;
  font-size: 0.78rem;
  font-weight: 700;
}

.empty,
.loading,
.error {
  border-radius: 18px;
  padding: 1rem;
  background: #fff;
}

.error {
  color: #a61b1b;
}
</style>
