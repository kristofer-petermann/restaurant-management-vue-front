<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useMenuCategoriesStore } from '@/stores/menu-categories-store'
import { useMenusStore } from '@/stores/menus-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'
import type { MenuCategory } from '@/types/menu'

const route = useRoute()
const authStore = useAuthStore()
const categoriesStore = useMenuCategoriesStore()
const menusStore = useMenusStore()
const restaurantUsersStore = useRestaurantUsersStore()
const editingCategory = ref<string | null>(null)
const isManager = computed(() => route.path.startsWith('/manager'))
const managedRestaurantIds = computed(() => authStore.isRoot || !isManager.value || !authStore.userId ? null : new Set(restaurantUsersStore.adminRestaurantIds(authStore.userId)))
const availableMenus = computed(() => managedRestaurantIds.value ? menusStore.menus.filter((menu) => managedRestaurantIds.value?.has(menu.restaurantId)) : menusStore.menus)
const availableMenuIds = computed(() => new Set(availableMenus.value.map((menu) => menu.id)))
const visibleCategories = computed(() => categoriesStore.categories.filter((category) => availableMenuIds.value.has(category.menuId)))
const categoryForm = reactive({ menuId: '', name: '', summary: '' })
const editCategoryForm = reactive({ menuId: '', name: '', summary: '' })
const hasError = computed(() => categoriesStore.error || menusStore.error || restaurantUsersStore.error)
async function submitCategory(): Promise<void> { const created = await categoriesStore.createCategoryWithValidation(categoryForm); if (created) { categoryForm.name = ''; categoryForm.summary = '' } }
function startEditCategory(item: MenuCategory): void { editingCategory.value = item.id; editCategoryForm.menuId = item.menuId; editCategoryForm.name = item.name; editCategoryForm.summary = item.summary }
function cancelEditCategory(): void { editingCategory.value = null; categoriesStore.clearError() }
async function submitEditCategory(item: MenuCategory): Promise<void> { const updated = await categoriesStore.updateCategoryWithValidation({ id: item.id, ...editCategoryForm }); if (updated) editingCategory.value = null }
onMounted(() => { void Promise.all([categoriesStore.loadCategories(), menusStore.loadMenus(), restaurantUsersStore.loadRestaurantUsers()]) })
</script>

<template><main class="categories-page"><h1>{{ isManager ? 'Manager categories' : 'Admin categories' }}</h1><p v-if="hasError" class="error">{{ hasError }}</p><section class="panel"><form class="grid" @submit.prevent="submitCategory"><label>Menu<select v-model="categoryForm.menuId"><option value="" disabled>Select menu</option><option v-for="item in availableMenus" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label>Name<input v-model.trim="categoryForm.name" type="text" /></label><label>Summary<input v-model.trim="categoryForm.summary" type="text" /></label><button type="submit">Add</button></form></section><section class="panel"><ul><li v-for="item in visibleCategories" :key="item.id" class="item-card"><form v-if="editingCategory === item.id" class="inline-form" @submit.prevent="submitEditCategory(item)"><select v-model="editCategoryForm.menuId"><option v-for="menu in availableMenus" :key="menu.id" :value="menu.id">{{ menu.name }}</option></select><input v-model.trim="editCategoryForm.name" type="text" /><input v-model.trim="editCategoryForm.summary" type="text" /><button type="submit">Save</button><button type="button" @click="cancelEditCategory">Cancel</button></form><template v-else><div><strong>{{ item.name }}</strong><p class="summary-muted">{{ item.summary || 'No summary' }}</p><span class="sort-muted">{{ menusStore.menuNameById(item.menuId) }}</span></div><div class="actions"><button type="button" @click="startEditCategory(item)">Edit</button><button type="button" @click="categoriesStore.removeCategory(item.id)">Delete</button></div></template></li></ul></section></main></template>

<style scoped>
.categories-page{max-width:700px;margin:0 auto;padding:1.5rem}.panel{border:1px solid #d5d9e2;border-radius:12px;padding:1rem;background:#fff;margin-bottom:1.2rem}.grid{display:grid;gap:.8rem;grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}.inline-form{display:flex;gap:.5rem;margin-bottom:.6rem;flex-wrap:wrap}label{display:grid;gap:.35rem}input,select{border:1px solid #b8c0cc;border-radius:8px;padding:.5rem .6rem;font:inherit}button{border:1px solid #0f4c81;border-radius:8px;background:#0f4c81;color:#fff;padding:.45rem .7rem;cursor:pointer;font:inherit}ul{list-style:none;margin:0;padding:0;display:grid;gap:.45rem}.item-card{display:flex;align-items:center;justify-content:space-between;gap:.7rem;border:1px solid #e5e7eb;border-radius:8px;padding:.6rem}.actions{display:flex;gap:.45rem;flex-wrap:wrap}.sort-muted{color:#6b7280;font-size:.92em}.summary-muted{margin:.15rem 0;color:#4b5563;font-size:.9rem}.error{margin:0;color:#a61b1b}
</style>
