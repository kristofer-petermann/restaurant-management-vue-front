<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useOpeningHoursStore } from '@/stores/opening-hours-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'
import { useRestaurantsStore } from '@/stores/restaurants-store'
import type { OpeningHour } from '@/types/opening-hour'

const route = useRoute()
const authStore = useAuthStore()
const hoursStore = useOpeningHoursStore()
const restaurantsStore = useRestaurantsStore()
const restaurantUsersStore = useRestaurantUsersStore()
const editingId = ref<string | null>(null)
const isManager = computed(() => route.path.startsWith('/manager'))
const managedRestaurantIds = computed(() =>
  authStore.isRoot || !isManager.value || !authStore.userId
    ? restaurantsStore.restaurants.map((restaurant) => restaurant.id)
    : restaurantUsersStore.adminRestaurantIds(authStore.userId),
)
const availableRestaurants = computed(() =>
  restaurantsStore.restaurants.filter((restaurant) => managedRestaurantIds.value.includes(restaurant.id)),
)
const visibleHours = computed(() =>
  hoursStore.openingHours.filter((item) => managedRestaurantIds.value.includes(item.restaurantId)),
)
const error = computed(() => hoursStore.error || restaurantsStore.error || restaurantUsersStore.error)
const form = reactive({ restaurantId: '', dayOfWeek: 'Monday', openTime: '09:00:00', closeTime: '17:00:00', summary: '' })
const editForm = reactive({ restaurantId: '', dayOfWeek: '', openTime: '', closeTime: '', summary: '' })

async function submitHour(): Promise<void> {
  if (!form.restaurantId) {
    hoursStore.error = 'Restaurant is required.'
    return
  }
  const ok = await hoursStore.addOpeningHour({
    restaurantId: form.restaurantId,
    dayOfWeek: form.dayOfWeek || null,
    openTime: form.openTime,
    closeTime: form.closeTime,
    summary: form.summary.trim() || null,
  })
  if (ok) form.summary = ''
}

function startEdit(item: OpeningHour): void {
  editingId.value = item.id
  editForm.restaurantId = item.restaurantId
  editForm.dayOfWeek = item.dayOfWeek ?? ''
  editForm.openTime = item.openTime
  editForm.closeTime = item.closeTime
  editForm.summary = item.summary ?? ''
}

async function submitEdit(item: OpeningHour): Promise<void> {
  const ok = await hoursStore.editOpeningHour({
    id: item.id,
    restaurantId: editForm.restaurantId,
    dayOfWeek: editForm.dayOfWeek || null,
    openTime: editForm.openTime,
    closeTime: editForm.closeTime,
    summary: editForm.summary.trim() || null,
  })
  if (ok) editingId.value = null
}

onMounted(() => {
  void Promise.all([
    hoursStore.loadOpeningHours(),
    restaurantsStore.loadRestaurants(),
    restaurantUsersStore.loadRestaurantUsers(),
  ])
})
</script>

<template>
  <main class="page">
    <h1>{{ isManager ? 'Manager opening hours' : 'Admin opening hours' }}</h1>
    <p v-if="error" class="error">{{ error }}</p>

    <section class="panel">
      <form class="grid" @submit.prevent="submitHour">
        <label>Restaurant<select v-model="form.restaurantId"><option value="" disabled>Select restaurant</option><option v-for="restaurant in availableRestaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.restaurantName || restaurant.id }}</option></select></label>
        <label>Day<input v-model.trim="form.dayOfWeek" type="text" /></label>
        <label>Open<input v-model="form.openTime" type="time" step="1" /></label>
        <label>Close<input v-model="form.closeTime" type="time" step="1" /></label>
        <label>Summary<input v-model.trim="form.summary" type="text" /></label>
        <button type="submit">Add hours</button>
      </form>
    </section>

    <section class="panel list">
      <article v-for="item in visibleHours" :key="item.id" class="row">
        <form v-if="editingId === item.id" class="inline-form" @submit.prevent="submitEdit(item)">
          <select v-model="editForm.restaurantId"><option v-for="restaurant in availableRestaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.restaurantName || restaurant.id }}</option></select>
          <input v-model.trim="editForm.dayOfWeek" type="text" />
          <input v-model="editForm.openTime" type="time" step="1" />
          <input v-model="editForm.closeTime" type="time" step="1" />
          <input v-model.trim="editForm.summary" type="text" />
          <button type="submit">Save</button><button type="button" @click="editingId = null">Cancel</button>
        </form>
        <template v-else>
          <div><strong>{{ item.dayOfWeek || 'Day' }}</strong><p>{{ restaurantsStore.restaurantNameById(item.restaurantId) }} · {{ item.openTime }}-{{ item.closeTime }}</p></div>
          <div class="actions"><button type="button" @click="startEdit(item)">Edit</button><button type="button" @click="hoursStore.removeOpeningHour(item.id)">Delete</button></div>
        </template>
      </article>
    </section>
  </main>
</template>

<style scoped>
.page{max-width:1000px;margin:0 auto;padding:1.5rem}.panel{border:1px solid #d5d9e2;border-radius:12px;padding:1rem;background:#fff;margin-bottom:1rem}.grid{display:grid;gap:.8rem;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}.inline-form{display:flex;gap:.5rem;flex-wrap:wrap}label{display:grid;gap:.35rem}input,select{border:1px solid #b8c0cc;border-radius:8px;padding:.5rem;font:inherit}button{border:1px solid #0f4c81;border-radius:8px;background:#0f4c81;color:#fff;padding:.45rem .7rem;cursor:pointer}.list{display:grid;gap:.5rem}.row{display:flex;justify-content:space-between;gap:1rem;border:1px solid #e5e7eb;border-radius:8px;padding:.7rem}.row p{margin:.2rem 0;color:#4b5563}.actions{display:flex;gap:.45rem;flex-wrap:wrap}.error{color:#a61b1b}
</style>
