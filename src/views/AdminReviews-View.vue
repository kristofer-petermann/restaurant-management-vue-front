<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'
import { useRestaurantsStore } from '@/stores/restaurants-store'
import { useReviewsStore } from '@/stores/reviews-store'

const route = useRoute()
const authStore = useAuthStore()
const reviewsStore = useReviewsStore()
const restaurantsStore = useRestaurantsStore()
const restaurantUsersStore = useRestaurantUsersStore()
const isManager = computed(() => route.path.startsWith('/manager'))
const managedRestaurantIds = computed(() =>
  authStore.isRoot || !isManager.value || !authStore.userId
    ? restaurantsStore.restaurants.map((restaurant) => restaurant.id)
    : restaurantUsersStore.adminRestaurantIds(authStore.userId),
)
const visibleReviews = computed(() =>
  reviewsStore.reviews.filter((review) => managedRestaurantIds.value.includes(review.restaurantId)),
)
const error = computed(() => reviewsStore.error || restaurantsStore.error || restaurantUsersStore.error)
const canDelete = computed(() => authStore.isRoot)

onMounted(() => {
  void Promise.all([
    reviewsStore.loadReviews(),
    restaurantsStore.loadRestaurants(),
    restaurantUsersStore.loadRestaurantUsers(),
  ])
})
</script>

<template>
  <main class="page">
    <h1>{{ isManager ? 'Manager reviews' : 'Admin reviews' }}</h1>
    <p class="hint">Managers can view reviews for administered restaurants. Root can moderate.</p>
    <p v-if="error" class="error">{{ error }}</p>

    <section class="cards">
      <article v-for="review in visibleReviews" :key="review.id" class="card">
        <header><strong>{{ restaurantsStore.restaurantNameById(review.restaurantId) }}</strong><span>{{ review.rating }}/5</span></header>
        <p>{{ review.comment || review.summary || 'No comment' }}</p>
        <small>User: {{ review.userId }} · {{ new Date(review.createdAt).toLocaleString() }}</small>
        <button v-if="canDelete" type="button" @click="reviewsStore.removeReview(review.id)">Delete</button>
      </article>
    </section>
  </main>
</template>

<style scoped>
.page{max-width:1000px;margin:0 auto;padding:1.5rem}.hint{color:#4b5563}.cards{display:grid;gap:.8rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}.card{border:1px solid #d5d9e2;border-radius:14px;background:#fff;padding:1rem;display:grid;gap:.5rem}.card header{display:flex;justify-content:space-between;gap:1rem}.card p{margin:0}.card small{color:#6b7280}button{width:fit-content;border:1px solid #b91c1c;border-radius:8px;background:#fff;color:#b91c1c;padding:.4rem .7rem;cursor:pointer}.error{color:#a61b1b}
</style>
