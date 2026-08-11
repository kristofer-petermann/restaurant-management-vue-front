<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'
import { useRestaurantsStore } from '@/stores/restaurants-store'
import type { Restaurant } from '@/types/restaurant'

const route = useRoute()
const authStore = useAuthStore()
const restaurantsStore = useRestaurantsStore()
const restaurantUsersStore = useRestaurantUsersStore()
const editingId = ref<string | null>(null)
const isManager = computed(() => route.path.startsWith('/manager'))
const managedRestaurantIds = computed(() =>
  authStore.isRoot || !isManager.value || !authStore.userId
    ? restaurantsStore.restaurants.map((restaurant) => restaurant.id)
    : restaurantUsersStore.adminRestaurantIds(authStore.userId),
)
const visibleRestaurants = computed(() =>
  restaurantsStore.restaurants.filter((restaurant) => managedRestaurantIds.value.includes(restaurant.id)),
)
const form = reactive({ restaurantName: '', description: '', phone: '', email: '', summary: '' })
const editForm = reactive({ restaurantName: '', description: '', phone: '', email: '', summary: '' })
const hasError = computed(() => restaurantsStore.error || restaurantUsersStore.error)

function resetForm(): void {
  form.restaurantName = ''
  form.description = ''
  form.phone = ''
  form.email = ''
  form.summary = ''
}

async function submitRestaurant(): Promise<void> {
  if (!authStore.isRoot) {
    restaurantsStore.error = 'Only root users can create restaurants.'
    return
  }
  if (!form.restaurantName.trim()) {
    restaurantsStore.error = 'Restaurant name is required.'
    return
  }

  const created = await restaurantsStore.addRestaurant({
    restaurantName: form.restaurantName.trim(),
    description: form.description.trim() || null,
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    summary: form.summary.trim() || null,
  })
  if (created) resetForm()
}

function startEdit(restaurant: Restaurant): void {
  editingId.value = restaurant.id
  editForm.restaurantName = restaurant.restaurantName ?? ''
  editForm.description = restaurant.description ?? ''
  editForm.phone = restaurant.phone ?? ''
  editForm.email = restaurant.email ?? ''
  editForm.summary = restaurant.summary ?? ''
}

async function submitEdit(restaurant: Restaurant): Promise<void> {
  if (!managedRestaurantIds.value.includes(restaurant.id)) {
    restaurantsStore.error = 'You can only manage administered restaurants.'
    return
  }

  const updated = await restaurantsStore.editRestaurant({
    id: restaurant.id,
    restaurantName: editForm.restaurantName.trim(),
    description: editForm.description.trim() || null,
    phone: editForm.phone.trim() || null,
    email: editForm.email.trim() || null,
    summary: editForm.summary.trim() || null,
  })
  if (updated) editingId.value = null
}

onMounted(() => {
  void Promise.all([restaurantsStore.loadRestaurants(), restaurantUsersStore.loadRestaurantUsers()])
})
</script>

<template>
  <main class="page">
    <h1>{{ isManager ? 'Manager restaurants' : 'Admin restaurants' }}</h1>
    <p v-if="hasError" class="error">{{ hasError }}</p>

    <section v-if="authStore.isRoot" class="panel">
      <form class="grid" @submit.prevent="submitRestaurant">
        <label>Name<input v-model.trim="form.restaurantName" type="text" /></label>
        <label>Description<input v-model.trim="form.description" type="text" /></label>
        <label>Phone<input v-model.trim="form.phone" type="text" /></label>
        <label>Email<input v-model.trim="form.email" type="email" /></label>
        <label>Summary<input v-model.trim="form.summary" type="text" /></label>
        <button type="submit">Add restaurant</button>
      </form>
    </section>

    <section v-else class="panel">
      <p>Restaurant admins can edit/delete administered restaurants, but creating restaurants is root-only.</p>
    </section>

    <section class="panel">
      <ul>
        <li v-for="restaurant in visibleRestaurants" :key="restaurant.id" class="item-card">
          <form v-if="editingId === restaurant.id" class="edit-form" @submit.prevent="submitEdit(restaurant)">
            <label>
              Restaurant name
              <input v-model.trim="editForm.restaurantName" type="text" autocomplete="organization" />
            </label>
            <label>
              Description
              <input v-model.trim="editForm.description" type="text" />
            </label>
            <label>
              Phone
              <input v-model.trim="editForm.phone" type="tel" autocomplete="tel" />
            </label>
            <label>
              Email
              <input v-model.trim="editForm.email" type="email" autocomplete="email" />
            </label>
            <label>
              Summary
              <input v-model.trim="editForm.summary" type="text" />
            </label>
            <div class="form-actions">
              <button type="submit">Save</button>
              <button type="button" class="secondary" @click="editingId = null">Cancel</button>
            </div>
          </form>

          <template v-else>
            <div>
              <strong>{{ restaurant.restaurantName || 'Unnamed restaurant' }}</strong>
              <p>{{ restaurant.description || restaurant.summary || 'No description' }}</p>
              <small>{{ restaurant.phone || 'No phone' }} · {{ restaurant.email || 'No email' }}</small>
            </div>
            <div class="actions">
              <button type="button" @click="startEdit(restaurant)">Edit</button>
              <button type="button" @click="restaurantsStore.removeRestaurant(restaurant.id)">Delete</button>
            </div>
          </template>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
}

.panel {
  border: 1px solid #d5d9e2;
  border-radius: 12px;
  padding: 1rem;
  background: #fff;
  margin-bottom: 1.2rem;
}

.grid,
.edit-form {
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.edit-form {
  width: 100%;
}

label {
  display: grid;
  gap: 0.35rem;
  color: #374151;
  font-weight: 700;
}

input {
  border: 1px solid #b8c0cc;
  border-radius: 8px;
  padding: 0.5rem 0.6rem;
  font: inherit;
  font-weight: 400;
}

button {
  border: 1px solid #0f4c81;
  border-radius: 8px;
  background: #0f4c81;
  color: #fff;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
  font: inherit;
}

.secondary {
  background: #fff;
  color: #0f4c81;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.item-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.7rem;
}

.item-card p {
  margin: 0.2rem 0;
  color: #4b5563;
}

.actions,
.form-actions {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  align-items: end;
}

.error {
  color: #a61b1b;
}
</style>
