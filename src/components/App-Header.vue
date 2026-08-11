<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'

const authStore = useAuthStore()
const cartStore = useCartStore()
const restaurantUsersStore = useRestaurantUsersStore()
const router = useRouter()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const isRestaurantAdmin = computed(() =>
  authStore.userId ? restaurantUsersStore.hasAnyRestaurantAdminRights(authStore.userId) : false,
)
const canOrder = computed(() => authStore.isRoot || !isRestaurantAdmin.value)

async function logOut() {
  cartStore.clearCart()
  await authStore.logoutUser()
  await router.push('/login')
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    void restaurantUsersStore.loadRestaurantUsers()
  }
})
</script>

<template>
  <header v-if="isLoggedIn" class="header">
    <nav class="nav">
      <RouterLink class="brand" to="/">Clean Onion Resto</RouterLink>
      <div class="links">
        <template v-if="canOrder">
          <RouterLink to="/restaurants">Restaurants</RouterLink>
          <RouterLink to="/cart">Cart ({{ cartStore.totalItems }})</RouterLink>
          <RouterLink to="/my-orders">My Orders</RouterLink>
        </template>

        <template v-if="isRestaurantAdmin && !authStore.isRoot">
          <RouterLink to="/manager/restaurants">Manager Restaurants</RouterLink>
          <RouterLink to="/manager/menus">Manager Menus</RouterLink>
          <RouterLink to="/manager/categories">Manager Categories</RouterLink>
          <RouterLink to="/manager/items">Manager Items</RouterLink>
          <RouterLink to="/manager/opening-hours">Manager Hours</RouterLink>
          <RouterLink to="/manager/orders">Manager Orders</RouterLink>
          <RouterLink to="/manager/reviews">Manager Reviews</RouterLink>
          <RouterLink to="/manager/addresses">Manager Addresses</RouterLink>
        </template>

        <template v-if="authStore.isRoot">
          <RouterLink to="/admin/restaurants">Admin Restaurants</RouterLink>
          <RouterLink to="/admin/menus">Admin Menus</RouterLink>
          <RouterLink to="/admin/orders">Admin Orders</RouterLink>
          <RouterLink to="/admin/reviews">Admin Reviews</RouterLink>
          <RouterLink to="/admin/restaurant-users">Admin Users</RouterLink>
          <RouterLink to="/admin/addresses">Admin Addresses</RouterLink>
        </template>

        <button type="button" @click="logOut">Logout</button>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header{position:sticky;top:0;z-index:10;border-bottom:1px solid #d4dae4;background:rgba(255,255,255,.92);backdrop-filter:blur(8px)}.nav{max-width:1200px;margin:0 auto;padding:.8rem 1rem;display:flex;justify-content:space-between;align-items:center;gap:1rem}.brand{font-weight:800;text-decoration:none;color:#164e3f;white-space:nowrap}.links{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;justify-content:flex-end}a{text-decoration:none;color:#1f2937}.router-link-active:not(.brand){color:#164e3f;font-weight:700}button{border:1px solid #164e3f;background:#164e3f;color:#fff;border-radius:8px;padding:.35rem .6rem;cursor:pointer}
</style>
