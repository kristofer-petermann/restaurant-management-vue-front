<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'
import { useRestaurantsStore } from '@/stores/restaurants-store'
import { RESTAURANT_USER_ROLE } from '@/types/permissions'
import type { RestaurantUser } from '@/types/restaurant-user'

const route = useRoute()
const authStore = useAuthStore()
const restaurantUsersStore = useRestaurantUsersStore()
const restaurantsStore = useRestaurantsStore()
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
const visibleLinks = computed(() =>
  restaurantUsersStore.restaurantUsers.filter((link) => managedRestaurantIds.value.includes(link.restaurantId)),
)
const error = computed(() => restaurantUsersStore.error || restaurantsStore.error)
const form = reactive<{ restaurantId: string; userId: string; userRole: number; role: string; summary: string }>({ restaurantId: '', userId: '', userRole: RESTAURANT_USER_ROLE.normal, role: 'user', summary: '' })
const editForm = reactive<{ restaurantId: string; userId: string; userRole: number; role: string; summary: string }>({ restaurantId: '', userId: '', userRole: RESTAURANT_USER_ROLE.normal, role: '', summary: '' })

async function submitLink(): Promise<void> {
  if (!form.restaurantId || !form.userId.trim()) {
    restaurantUsersStore.error = 'Restaurant and user id are required.'
    return
  }
  await restaurantUsersStore.addRestaurantUser({
    restaurantId: form.restaurantId,
    userId: form.userId.trim(),
    userRole: authStore.isRoot ? Number(form.userRole) : RESTAURANT_USER_ROLE.normal,
    role: authStore.isRoot ? form.role.trim() || 'user' : 'user',
    summary: form.summary.trim() || null,
  })
}

function startEdit(link: RestaurantUser): void {
  editingId.value = link.id
  editForm.restaurantId = link.restaurantId
  editForm.userId = link.userId
  editForm.userRole = link.userRole
  editForm.role = link.role ?? ''
  editForm.summary = link.summary ?? ''
}

async function submitEdit(link: RestaurantUser): Promise<void> {
  if (isManager.value && link.userId === authStore.userId) {
    restaurantUsersStore.error = 'Managers cannot edit their own membership here.'
    return
  }
  const ok = await restaurantUsersStore.editRestaurantUser({
    id: link.id,
    restaurantId: editForm.restaurantId,
    userId: editForm.userId,
    userRole: authStore.isRoot ? Number(editForm.userRole) : RESTAURANT_USER_ROLE.normal,
    role: authStore.isRoot ? editForm.role || null : 'user',
    summary: editForm.summary || null,
  })
  if (ok) editingId.value = null
}

onMounted(() => {
  void Promise.all([restaurantUsersStore.loadRestaurantUsers(), restaurantsStore.loadRestaurants()])
})
</script>

<template>
  <main class="page">
    <h1>{{ isManager ? 'Manager restaurant users' : 'Admin restaurant users' }}</h1>
    <p v-if="error" class="error">{{ error }}</p>
    <section class="panel">
      <form class="grid" @submit.prevent="submitLink">
        <label>Restaurant<select v-model="form.restaurantId"><option value="" disabled>Select restaurant</option><option v-for="restaurant in availableRestaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.restaurantName || restaurant.id }}</option></select></label>
        <label>User ID<input v-model.trim="form.userId" type="text" /></label>
        <label v-if="authStore.isRoot">Role number<input v-model.number="form.userRole" type="number" min="0" /></label>
        <label v-if="authStore.isRoot">Role label<input v-model.trim="form.role" type="text" /></label>
        <label>Summary<input v-model.trim="form.summary" type="text" /></label>
        <button type="submit">Add membership</button>
      </form>
    </section>
    <section class="panel list">
      <article v-for="link in visibleLinks" :key="link.id" class="row">
        <form v-if="editingId === link.id" class="inline-form" @submit.prevent="submitEdit(link)">
          <select v-model="editForm.restaurantId"><option v-for="restaurant in availableRestaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.restaurantName || restaurant.id }}</option></select>
          <input v-model.trim="editForm.userId" type="text" />
          <input v-if="authStore.isRoot" v-model.number="editForm.userRole" type="number" min="0" />
          <input v-if="authStore.isRoot" v-model.trim="editForm.role" type="text" />
          <input v-model.trim="editForm.summary" type="text" />
          <button type="submit">Save</button><button type="button" @click="editingId = null">Cancel</button>
        </form>
        <template v-else>
          <div><strong>{{ restaurantsStore.restaurantNameById(link.restaurantId) }}</strong><p>User {{ link.userId }} · role {{ link.userRole }} {{ link.role || '' }}</p></div>
          <div class="actions"><button type="button" @click="startEdit(link)">Edit</button><button type="button" @click="restaurantUsersStore.removeRestaurantUser(link.id)">Delete</button></div>
        </template>
      </article>
    </section>
  </main>
</template>

<style scoped>
.page{max-width:1100px;margin:0 auto;padding:1.5rem}.panel{border:1px solid #d5d9e2;border-radius:12px;background:#fff;padding:1rem;margin-bottom:1rem}.grid{display:grid;gap:.8rem;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}.inline-form{display:flex;gap:.5rem;flex-wrap:wrap}label{display:grid;gap:.35rem}input,select{border:1px solid #b8c0cc;border-radius:8px;padding:.5rem;font:inherit}button{border:1px solid #0f4c81;border-radius:8px;background:#0f4c81;color:#fff;padding:.45rem .7rem;cursor:pointer}.list{display:grid;gap:.5rem}.row{display:flex;justify-content:space-between;gap:1rem;border:1px solid #e5e7eb;border-radius:8px;padding:.7rem}.row p{margin:.2rem 0;color:#4b5563}.actions{display:flex;gap:.45rem;flex-wrap:wrap}.error{color:#a61b1b}
</style>
