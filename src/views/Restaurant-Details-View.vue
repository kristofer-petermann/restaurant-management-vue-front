<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { useMenuCategoriesStore } from '@/stores/menu-categories-store'
import { useMenuItemsStore } from '@/stores/menu-items-store'
import { useMenusStore } from '@/stores/menus-store'
import { useOpeningHoursStore } from '@/stores/opening-hours-store'
import { useRestaurantsStore } from '@/stores/restaurants-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'
import { useReviewsStore } from '@/stores/reviews-store'
import type { MenuItem } from '@/types/menu'
import type { Review } from '@/types/review'

const route = useRoute()
const restaurantId = computed(() => String(route.params.id ?? ''))
const authStore = useAuthStore()
const restaurantsStore = useRestaurantsStore()
const menusStore = useMenusStore()
const categoriesStore = useMenuCategoriesStore()
const itemsStore = useMenuItemsStore()
const openingHoursStore = useOpeningHoursStore()
const reviewsStore = useReviewsStore()
const cartStore = useCartStore()
const restaurantUsersStore = useRestaurantUsersStore()
const editingReviewId = ref<string | null>(null)
const reviewForm = reactive({ rating: 5, comment: '' })
const editReviewForm = reactive({ rating: 5, comment: '' })
const orderingError = ref<string | null>(null)

const restaurant = computed(() => restaurantsStore.restaurantById(restaurantId.value))
const activeMenus = computed(() => menusStore.activeMenus.filter((menu) => menu.restaurantId === restaurantId.value))
const menuSections = computed(() =>
  activeMenus.value.map((menu) => {
    const categories = categoriesStore.categories
      .filter((category) => category.menuId === menu.id)
      .map((category) => ({
        category,
        items: itemsStore.availableItems.filter((item) => item.menuCategoryId === category.id),
      }))

    return { menu, categories }
  }),
)
const hasMenuContent = computed(() =>
  menuSections.value.some((menuSection) =>
    menuSection.categories.some((categorySection) => categorySection.items.length > 0),
  ),
)
const openingHours = computed(() => openingHoursStore.hoursForRestaurant(restaurantId.value))
const reviews = computed(() => reviewsStore.reviewsForRestaurant(restaurantId.value))
const averageRating = computed(() => reviewsStore.averageRatingForRestaurant(restaurantId.value))
const loading = computed(
  () => restaurantsStore.loading || menusStore.loading || categoriesStore.loading || itemsStore.loading || openingHoursStore.loading || reviewsStore.loading,
)
const error = computed(
  () => orderingError.value || restaurantsStore.error || menusStore.error || categoriesStore.error || itemsStore.error || openingHoursStore.error || reviewsStore.error,
)
const isRestaurantAdmin = computed(() =>
  authStore.userId ? restaurantUsersStore.hasAnyRestaurantAdminRights(authStore.userId) : false,
)
const orderingBlocked = computed(() => !authStore.isRoot && isRestaurantAdmin.value)

function addToCart(item: MenuItem): void {
  if (orderingBlocked.value) {
    orderingError.value = 'Ordering is not available for restaurant administrators.'
    return
  }
  cartStore.addItem(restaurantId.value, item)
}

function canEditReview(review: Review): boolean {
  return Boolean(authStore.userId && review.userId === authStore.userId)
}

async function submitReview(): Promise<void> {
  if (!authStore.userId) {
    reviewsStore.error = 'Could not identify the logged-in user from the token.'
    return
  }
  const ok = await reviewsStore.addReview({
    userId: authStore.userId,
    restaurantId: restaurantId.value,
    rating: Number(reviewForm.rating),
    comment: reviewForm.comment.trim() || null,
    createdAt: new Date().toISOString(),
    summary: reviewForm.comment.trim() || null,
  })
  if (ok) {
    reviewForm.rating = 5
    reviewForm.comment = ''
  }
}

function startEditReview(review: Review): void {
  editingReviewId.value = review.id
  editReviewForm.rating = review.rating
  editReviewForm.comment = review.comment ?? ''
}

async function submitEditReview(review: Review): Promise<void> {
  if (!canEditReview(review)) {
    reviewsStore.error = 'You can only edit your own reviews.'
    return
  }
  const ok = await reviewsStore.editReview({
    ...review,
    rating: Number(editReviewForm.rating),
    comment: editReviewForm.comment.trim() || null,
    summary: editReviewForm.comment.trim() || null,
  })
  if (ok) editingReviewId.value = null
}

async function deleteReview(review: Review): Promise<void> {
  if (!canEditReview(review)) {
    reviewsStore.error = 'You can only delete your own reviews.'
    return
  }
  await reviewsStore.removeReview(review.id)
}

onMounted(() => {
  void Promise.all([
    restaurantsStore.loadRestaurants(),
    menusStore.loadMenus(),
    categoriesStore.loadCategories(),
    itemsStore.loadItems(),
    openingHoursStore.loadOpeningHours(),
    reviewsStore.loadReviews(),
    restaurantUsersStore.loadRestaurantUsers(),
  ])
})
</script>

<template>
  <main class="page">
    <RouterLink class="back-link" to="/restaurants">Back to restaurants</RouterLink>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading" class="loading">Loading restaurant...</p>

    <section v-if="restaurant" class="restaurant-hero"><div><p class="eyebrow">Selected restaurant</p><h1>{{ restaurant.restaurantName || 'Unnamed restaurant' }}</h1><p>{{ restaurant.description || restaurant.summary || 'Build your pickup order below.' }}</p><p v-if="averageRating" class="rating">Average review: {{ averageRating.toFixed(1) }}/5</p><p v-if="orderingBlocked" class="warning">Ordering is disabled for restaurant administrators.</p></div><RouterLink v-if="!orderingBlocked" class="cart-pill" to="/cart">Cart: {{ cartStore.totalItems }}</RouterLink></section>

    <section v-if="restaurant" class="info-grid">
      <article class="category-card">
        <h2>Opening hours</h2>
        <ul v-if="openingHours.length" class="simple-list">
          <li v-for="hour in openingHours" :key="hour.id">
            <strong>{{ hour.dayOfWeek || 'Day' }}</strong>
            <span>{{ hour.openTime }}-{{ hour.closeTime }}</span>
          </li>
        </ul>
        <p v-else class="muted">No opening hours published yet.</p>
      </article>
    </section>

    <section v-if="restaurant && menuSections.length && hasMenuContent" class="menu-stack">
      <article v-for="menuSection in menuSections" :key="menuSection.menu.id" class="menu-card">
        <header class="menu-header">
          <div>
            <p class="eyebrow dark">Menu</p>
            <h2>{{ menuSection.menu.name }}</h2>
            <p>{{ menuSection.menu.summary || 'Browse categories and available items.' }}</p>
          </div>
          <span class="menu-status">{{ menuSection.menu.isActive ? 'Active' : 'Inactive' }}</span>
        </header>

        <section v-for="group in menuSection.categories" :key="group.category.id" class="category-section">
          <header>
            <h3>{{ group.category.name }}</h3>
            <p>{{ group.category.summary || 'Fresh picks from this category.' }}</p>
          </header>

          <div v-if="group.items.length" class="items-grid">
            <article v-for="item in group.items" :key="item.id" class="item-card">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
              <div class="item-body">
                <h4>{{ item.name }}</h4>
                <p>{{ item.description || item.summary || 'No description yet.' }}</p>
                <div class="item-footer">
                  <strong>${{ item.price.toFixed(2) }}</strong>
                  <button type="button" :disabled="orderingBlocked" @click="addToCart(item)">Add</button>
                </div>
              </div>
            </article>
          </div>

          <p v-else class="muted">No available items in this category.</p>
        </section>
      </article>
    </section>
    <section v-else-if="restaurant && !loading" class="empty"><h2>No active menu yet</h2><p>This restaurant does not currently have active menu items.</p></section>

    <section v-if="restaurant" class="category-card reviews"><h2>Reviews</h2><form class="review-form" @submit.prevent="submitReview"><label>Rating<input v-model.number="reviewForm.rating" type="number" min="1" max="5" /></label><label>Comment<input v-model.trim="reviewForm.comment" type="text" placeholder="How was it?" /></label><button type="submit">Add review</button></form><article v-for="review in reviews" :key="review.id" class="review-card"><form v-if="editingReviewId === review.id" class="review-form" @submit.prevent="submitEditReview(review)"><input v-model.number="editReviewForm.rating" type="number" min="1" max="5" /><input v-model.trim="editReviewForm.comment" type="text" /><button type="submit">Save</button><button type="button" @click="editingReviewId = null">Cancel</button></form><template v-else><header><strong>{{ review.rating }}/5</strong><small>{{ new Date(review.createdAt).toLocaleString() }}</small></header><p>{{ review.comment || review.summary || 'No comment' }}</p><div v-if="canEditReview(review)" class="actions"><button type="button" @click="startEditReview(review)">Edit</button><button type="button" @click="deleteReview(review)">Delete</button></div></template></article></section>
  </main>
</template>

<style scoped>
.page{max-width:1120px;margin:0 auto;padding:1.5rem}.back-link,.cart-pill{display:inline-flex;width:fit-content;text-decoration:none;color:#164e3f;font-weight:700}.restaurant-hero{margin:1rem 0;border-radius:28px;padding:1.6rem;display:flex;justify-content:space-between;gap:1rem;color:#fff;background:linear-gradient(135deg,#173f35,#7a3d13)}.eyebrow{margin:0 0 .35rem;text-transform:uppercase;letter-spacing:.12em;font-size:.78rem}.dark{color:#7a3d13;font-weight:800}.restaurant-hero h1,.restaurant-hero p{margin:0}.rating{margin-top:.5rem!important;color:#fff3d6}.cart-pill{align-self:start;border-radius:999px;background:#fff3d6;color:#5b330e;padding:.5rem .8rem}.info-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-bottom:1rem}.menu-stack{display:grid;gap:1.2rem}.menu-card{border:1px solid #d8dfd8;border-radius:24px;background:#fff;padding:1rem;display:grid;gap:1rem}.menu-header{display:flex;justify-content:space-between;gap:1rem;align-items:start;border-bottom:1px solid #e5e7eb;padding-bottom:.8rem}.menu-header h2,.menu-header p{margin:.1rem 0}.menu-status{border-radius:999px;background:#dcfce7;color:#166534;padding:.22rem .65rem;font-size:.82rem;font-weight:800}.category-section{display:grid;gap:.7rem}.category-section header h3,.category-section header p{margin:.1rem 0}.category-section header p{color:#66756f}.category-card,.empty,.loading,.error{border:1px solid #d8dfd8;border-radius:22px;background:#fff;padding:1rem}.category-card header h2,.category-card header p{margin:.1rem 0}.items-grid{display:grid;gap:.85rem;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:.8rem}.item-card{overflow:hidden;border:1px solid #e5e7eb;border-radius:18px;background:#fffaf0}.item-card img{width:100%;height:150px;object-fit:cover}.item-body{display:grid;gap:.5rem;padding:.8rem}.item-body h3,.item-body p{margin:0}.item-footer{display:flex;justify-content:space-between;align-items:center}button{border:none;border-radius:999px;background:#164e3f;color:#fff;padding:.45rem .8rem;cursor:pointer}.muted{color:#66756f}.error{color:#a61b1b}.simple-list{list-style:none;padding:0;display:grid;gap:.45rem}.simple-list li{display:flex;justify-content:space-between;gap:1rem}.reviews{margin-top:1rem;display:grid;gap:.8rem}.review-form{display:flex;gap:.6rem;flex-wrap:wrap}.review-form label{display:grid;gap:.25rem}.review-form input{border:1px solid #b8c0cc;border-radius:10px;padding:.5rem;font:inherit}.review-card{border:1px solid #e5e7eb;border-radius:14px;padding:.8rem}.review-card header{display:flex;justify-content:space-between;gap:1rem}.review-card p{margin:.4rem 0}.actions{display:flex;gap:.45rem;flex-wrap:wrap}
.warning{margin:.5rem 0 0;color:#fff3d6;font-weight:600}button:disabled{opacity:.6;cursor:not-allowed}
</style>
