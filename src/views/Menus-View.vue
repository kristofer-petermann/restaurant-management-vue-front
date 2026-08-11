<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useMenusStore } from '@/stores/menus-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'
import { useRestaurantsStore } from '@/stores/restaurants-store'
import type { Menu } from '@/types/menu'

const route = useRoute()
const authStore = useAuthStore()
const menusStore = useMenusStore()
const restaurantsStore = useRestaurantsStore()
const restaurantUsersStore = useRestaurantUsersStore()
const editingMenu = ref<string | null>(null)
const isManager = computed(() => route.path.startsWith('/manager'))
const managedRestaurantIds = computed(() => authStore.isRoot || !isManager.value || !authStore.userId ? restaurantsStore.restaurants.map((restaurant) => restaurant.id) : restaurantUsersStore.adminRestaurantIds(authStore.userId))
const availableRestaurants = computed(() => restaurantsStore.restaurants.filter((restaurant) => managedRestaurantIds.value.includes(restaurant.id)))
const visibleMenus = computed(() => menusStore.menus.filter((menu) => managedRestaurantIds.value.includes(menu.restaurantId)))
const menuForm = reactive({ restaurantId: '', name: '', isActive: true, summary: '' })
const editMenuForm = reactive({ restaurantId: '', name: '', isActive: true, summary: '' })
const hasError = computed(() => menusStore.error || restaurantsStore.error || restaurantUsersStore.error)

async function submitMenu(): Promise<void> {
  const created = await menusStore.createMenuWithValidation(menuForm)
  if (created) { menuForm.name = ''; menuForm.summary = '' }
}
function startEditMenu(menu: Menu): void { editingMenu.value = menu.id; editMenuForm.restaurantId = menu.restaurantId; editMenuForm.name = menu.name; editMenuForm.isActive = menu.isActive; editMenuForm.summary = menu.summary }
function cancelEditMenu(): void { editingMenu.value = null; menusStore.clearError() }
async function submitEditMenu(menu: Menu): Promise<void> { const updated = await menusStore.updateMenuWithValidation({ id: menu.id, ...editMenuForm }); if (updated) editingMenu.value = null }

onMounted(() => { void Promise.all([menusStore.loadMenus(), restaurantsStore.loadRestaurants(), restaurantUsersStore.loadRestaurantUsers()]) })
</script>

<template>
  <main class="menus-page">
    <h1>{{ isManager ? 'Manager menus' : 'Admin menus' }}</h1><p v-if="hasError" class="error">{{ hasError }}</p>
    <section class="panel"><form class="grid" @submit.prevent="submitMenu"><label>Restaurant<select v-model="menuForm.restaurantId"><option value="" disabled>Select restaurant</option><option v-for="restaurant in availableRestaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.restaurantName || restaurant.id }}</option></select></label><label>Name<input v-model.trim="menuForm.name" type="text" /></label><label>Summary<input v-model.trim="menuForm.summary" type="text" /></label><label class="inline-checkbox"><input v-model="menuForm.isActive" type="checkbox" />Active menu</label><button type="submit">Add Menu</button></form></section>
    <section class="panel"><ul><li v-for="menu in visibleMenus" :key="menu.id" class="item-card"><form v-if="editingMenu === menu.id" class="inline-form" @submit.prevent="submitEditMenu(menu)"><select v-model="editMenuForm.restaurantId"><option v-for="restaurant in availableRestaurants" :key="restaurant.id" :value="restaurant.id">{{ restaurant.restaurantName || restaurant.id }}</option></select><input v-model.trim="editMenuForm.name" type="text" /><input v-model.trim="editMenuForm.summary" type="text" /><label class="inline-checkbox"><input v-model="editMenuForm.isActive" type="checkbox" />Active</label><button type="submit">Save</button><button type="button" @click="cancelEditMenu">Cancel</button></form><template v-else><div><strong>{{ menu.name }}</strong><p class="summary-muted">{{ menu.summary || 'No summary' }}</p><p class="sort-muted">Restaurant: {{ restaurantsStore.restaurantNameById(menu.restaurantId) }}</p><span :class="menu.isActive ? 'available' : 'unavailable'">{{ menu.isActive ? 'Active' : 'Inactive' }}</span></div><div class="actions"><button type="button" @click="startEditMenu(menu)">Edit</button><button type="button" @click="menusStore.removeMenu(menu.id)">Delete</button></div></template></li></ul></section>
  </main>
</template>

<style scoped>
.menus-page{max-width:850px;margin:0 auto;padding:1.5rem}.panel{border:1px solid #d5d9e2;border-radius:12px;padding:1rem;background:#fff;margin-bottom:1.2rem}.grid{display:grid;gap:.8rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.inline-form{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.6rem}label{display:grid;gap:.35rem}input,select{border:1px solid #b8c0cc;border-radius:8px;padding:.5rem .6rem;font:inherit}button{border:1px solid #0f4c81;border-radius:8px;background:#0f4c81;color:#fff;padding:.45rem .7rem;cursor:pointer;font:inherit}ul{list-style:none;margin:0;padding:0;display:grid;gap:.45rem}.item-card{display:flex;align-items:center;justify-content:space-between;gap:.7rem;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem}.actions{display:flex;gap:.45rem;flex-wrap:wrap}.inline-checkbox{display:inline-flex;align-items:center;gap:.4rem}.sort-muted{color:#6b7280;font-size:.86rem;margin:.15rem 0}.summary-muted{margin:.2rem 0;color:#4b5563}.available,.unavailable{display:inline-block;border-radius:999px;padding:.12rem .5rem;font-size:.82rem}.available{background:#dcfce7;color:#166534}.unavailable{background:#e5e7eb;color:#374151}.error{margin:0;color:#a61b1b}
</style>
