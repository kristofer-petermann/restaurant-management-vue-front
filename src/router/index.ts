import { useAuthStore } from '@/stores/auth-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'
import AboutView from '@/views/About-View.vue'
import AdminOrdersView from '@/views/AdminOrders-View.vue'
import AdminRestaurantsView from '@/views/AdminRestaurants-View.vue'
import CartView from '@/views/Cart-View.vue'
import CheckoutView from '@/views/Checkout-View.vue'
import LoginView from '@/views/Login-View.vue'
import MainView from '@/views/Main-View.vue'
import MenusView from '@/views/Menus-View.vue'
import MyOrdersView from '@/views/MyOrders-View.vue'
import NotAuthorizedView from '@/views/NotAuthorized-View.vue'
import NotFoundView from '@/views/NotFound-View.vue'
import OrderDetailsView from '@/views/Order-Details-View.vue'
import RegisterView from '@/views/Register-View.vue'
import RestaurantDetailsView from '@/views/Restaurant-Details-View.vue'
import RestaurantsView from '@/views/Restaurants-View.vue'
import MenuCategoriesView from '@/views/MenuCategories-View.vue'
import MenuItemsView from '@/views/MenuItems-View.vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const AdminOpeningHoursView = () => import('@/views/AdminOpeningHours-View.vue')
const AdminAddressesView = () => import('@/views/AdminAddresses-View.vue')
const AdminReviewsView = () => import('@/views/AdminReviews-View.vue')
const AdminRestaurantUsersView = () => import('@/views/AdminRestaurantUsers-View.vue')

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: MainView, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginView, meta: { publicOnly: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { publicOnly: true } },
  { path: '/restaurants', name: 'Restaurants', component: RestaurantsView, meta: { requiresAuth: true } },
  { path: '/restaurants/:id', name: 'RestaurantDetails', component: RestaurantDetailsView, meta: { requiresAuth: true } },
  { path: '/cart', name: 'Cart', component: CartView, meta: { requiresAuth: true } },
  { path: '/checkout', name: 'Checkout', component: CheckoutView, meta: { requiresAuth: true } },
  { path: '/orders/:id', name: 'OrderDetails', component: OrderDetailsView, meta: { requiresAuth: true } },
  { path: '/my-orders', name: 'MyOrders', component: MyOrdersView, meta: { requiresAuth: true } },
  { path: '/about', name: 'About', component: AboutView, meta: { requiresAuth: true } },
  { path: '/not-authorized', name: 'NotAuthorized', component: NotAuthorizedView },

  { path: '/admin', redirect: '/admin/restaurants', meta: { requiresAuth: true, requiresRoot: true } },
  { path: '/admin/restaurants', name: 'AdminRestaurants', component: AdminRestaurantsView, meta: { requiresAuth: true, requiresRoot: true } },
  { path: '/admin/menus', name: 'AdminMenus', component: MenusView, meta: { requiresAuth: true, requiresRoot: true } },
  { path: '/admin/categories', name: 'AdminMenuCategories', component: MenuCategoriesView, meta: { requiresAuth: true, requiresRoot: true } },
  { path: '/admin/items', name: 'AdminMenuItems', component: MenuItemsView, meta: { requiresAuth: true, requiresRoot: true } },
  { path: '/admin/opening-hours', name: 'AdminOpeningHours', component: AdminOpeningHoursView, meta: { requiresAuth: true, requiresRoot: true } },
  { path: '/admin/orders', name: 'AdminOrders', component: AdminOrdersView, meta: { requiresAuth: true, requiresRoot: true } },
  { path: '/admin/reviews', name: 'AdminReviews', component: AdminReviewsView, meta: { requiresAuth: true, requiresRoot: true } },
  { path: '/admin/restaurant-users', name: 'AdminRestaurantUsers', component: AdminRestaurantUsersView, meta: { requiresAuth: true, requiresRoot: true } },
  { path: '/admin/addresses', name: 'AdminAddresses', component: AdminAddressesView, meta: { requiresAuth: true, requiresRoot: true } },

  { path: '/manager', redirect: '/manager/restaurants', meta: { requiresAuth: true, requiresRestaurantAdmin: true } },
  { path: '/manager/restaurants', name: 'ManagerRestaurants', component: AdminRestaurantsView, meta: { requiresAuth: true, requiresRestaurantAdmin: true } },
  { path: '/manager/menus', name: 'ManagerMenus', component: MenusView, meta: { requiresAuth: true, requiresRestaurantAdmin: true } },
  { path: '/manager/categories', name: 'ManagerCategories', component: MenuCategoriesView, meta: { requiresAuth: true, requiresRestaurantAdmin: true } },
  { path: '/manager/items', name: 'ManagerItems', component: MenuItemsView, meta: { requiresAuth: true, requiresRestaurantAdmin: true } },
  { path: '/manager/opening-hours', name: 'ManagerOpeningHours', component: AdminOpeningHoursView, meta: { requiresAuth: true, requiresRestaurantAdmin: true } },
  { path: '/manager/orders', name: 'ManagerOrders', component: AdminOrdersView, meta: { requiresAuth: true, requiresRestaurantAdmin: true } },
  { path: '/manager/reviews', name: 'ManagerReviews', component: AdminReviewsView, meta: { requiresAuth: true, requiresRestaurantAdmin: true } },
  { path: '/manager/addresses', name: 'ManagerAddresses', component: AdminAddressesView, meta: { requiresAuth: true, requiresRestaurantAdmin: true } },

  { path: '/menus', redirect: '/manager/menus' },
  { path: '/menucategories', redirect: '/manager/categories' },
  { path: '/menuitems', redirect: '/manager/items' },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const ORDERING_ROUTE_NAMES = new Set([
  'Restaurants',
  'RestaurantDetails',
  'Cart',
  'Checkout',
  'MyOrders',
  
])

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  authStore.initializeFromStorage()

  const requiresAuth = Boolean(to.meta.requiresAuth)
  const publicOnly = Boolean(to.meta.publicOnly)
  const requiresRoot = Boolean(to.meta.requiresRoot)
  const requiresRestaurantAdmin = Boolean(to.meta.requiresRestaurantAdmin)

  if (requiresAuth && !authStore.isLoggedIn) {
    return { name: 'Login' }
  }

  if (publicOnly && authStore.isLoggedIn) {
    return { name: 'Home' }
  }

  if (authStore.isLoggedIn && !authStore.isRoot && ORDERING_ROUTE_NAMES.has(String(to.name ?? ''))) {
    const restaurantUsersStore = useRestaurantUsersStore()
    if (!restaurantUsersStore.restaurantUsers.length) {
      await restaurantUsersStore.loadRestaurantUsers()
    }

    const hasRestaurantAdminRights = authStore.userId
      ? restaurantUsersStore.hasAnyRestaurantAdminRights(authStore.userId)
      : false

    if (hasRestaurantAdminRights) {
      return { name: 'NotAuthorized' }
    }
  }

  if (requiresRoot && !authStore.isRoot) {
    return { name: 'NotAuthorized' }
  }

  if (requiresRestaurantAdmin && !authStore.isRoot) {
    const restaurantUsersStore = useRestaurantUsersStore()
    if (!restaurantUsersStore.restaurantUsers.length) {
      await restaurantUsersStore.loadRestaurantUsers()
    }

    const hasRestaurantAdminRights = authStore.userId
      ? restaurantUsersStore.hasAnyRestaurantAdminRights(authStore.userId)
      : false

    if (!hasRestaurantAdminRights) {
      return { name: 'NotAuthorized' }
    }
  }
})

export default router
