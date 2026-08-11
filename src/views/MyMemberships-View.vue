<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'
import { useRestaurantsStore } from '@/stores/restaurants-store'

const authStore = useAuthStore()
const membershipsStore = useRestaurantUsersStore()
const restaurantsStore = useRestaurantsStore()
const form = reactive({ restaurantId: '', summary: '' })
const myMemberships = computed(() => authStore.userId ? membershipsStore.linksForUser(authStore.userId) : [])

async function submitMembership(): Promise<void> {
  if (!authStore.userId || !form.restaurantId) {
    membershipsStore.error = 'Restaurant and logged-in user id are required.'
    return
  }
  await membershipsStore.addNormalMembership({
    restaurantId: form.restaurantId,
    userId: authStore.userId,
    summary: form.summary.trim() || null,
  })
}

onMounted(() => {
  void Promise.all([membershipsStore.loadRestaurantUsers(), restaurantsStore.loadRestaurants()])
})
</script>

<template>
  <main class="page">
    <h1>My memberships</h1>
    <p v-if="membershipsStore.error" class="error">{{ membershipsStore.error }}</p>
    <section class="panel"><form class="grid" @submit.prevent="submitMembership"><label>Restaurant<select v-model="form.restaurantId"><option value="" disabled>Select restaurant</option><option v-for="restaurant in restaurantsStore.restaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.restaurantName || restaurant.id }}</option></select></label><label>Summary<input v-model.trim="form.summary" type="text" /></label><button type="submit">Join as user</button></form></section>
    <section class="panel list"><article v-for="link in myMemberships" :key="link.id" class="row"><div><strong>{{ restaurantsStore.restaurantNameById(link.restaurantId) }}</strong><p>Role {{ link.userRole }} {{ link.role || '' }}</p></div><button type="button" @click="membershipsStore.removeRestaurantUser(link.id)">Delete</button></article></section>
  </main>
</template>

<style scoped>
.page{max-width:850px;margin:0 auto;padding:1.5rem}.panel{border:1px solid #d5d9e2;border-radius:12px;background:#fff;padding:1rem;margin-bottom:1rem}.grid{display:grid;gap:.8rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}label{display:grid;gap:.35rem}input,select{border:1px solid #b8c0cc;border-radius:8px;padding:.5rem;font:inherit}button{border:1px solid #0f4c81;border-radius:8px;background:#0f4c81;color:#fff;padding:.45rem .7rem;cursor:pointer}.list{display:grid;gap:.5rem}.row{display:flex;justify-content:space-between;gap:1rem;border:1px solid #e5e7eb;border-radius:8px;padding:.7rem}.row p{margin:.2rem 0;color:#4b5563}.error{color:#a61b1b}
</style>
