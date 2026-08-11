<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { useOpeningHoursStore } from '@/stores/opening-hours-store'
import { useOrdersStore } from '@/stores/orders-store'
import { usePaymentsStore } from '@/stores/payments-store'
import { useRestaurantUsersStore } from '@/stores/restaurant-users-store'
import { ORDER_STATUS } from '@/types/order'
import { PAYMENT_STATUS } from '@/types/payment'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const paymentsStore = usePaymentsStore()
const openingHoursStore = useOpeningHoursStore()
const restaurantUsersStore = useRestaurantUsersStore()
const submitting = ref(false)
const paymentMethod = ref('Card')

const localError = ref<string | null>(null)


const restaurantHours = computed(() => cartStore.restaurantId ? openingHoursStore.hoursForRestaurant(cartStore.restaurantId) : [])
const error = computed(() => localError.value || ordersStore.error || paymentsStore.error)

function pickupWarning(): string | null {
  if (!cartStore.pickupTime || !restaurantHours.value.length) {
    return null
  }

  const pickup = new Date(cartStore.pickupTime)
  const dayName = pickup.toLocaleDateString('en-US', { weekday: 'long' })
  const hour = restaurantHours.value.find((item) => (item.dayOfWeek ?? '').toLowerCase() === dayName.toLowerCase())
  if (!hour) {
    return `No opening hours are published for ${dayName}.`
  }

  const time = pickup.toTimeString().slice(0, 8)
  if (time < hour.openTime || time > hour.closeTime) {
    return `Pickup time may be outside published hours (${hour.openTime}-${hour.closeTime}).`
  }

  return null
}

async function submitOrder(): Promise<void> {
  localError.value = null
  if (!cartStore.restaurantId) {
    localError.value = 'Your cart is empty.'
    return
  }

  submitting.value = true
  // Prevent restaurant admins from placing orders for restaurants they manage
  if (authStore.userId && cartStore.restaurantId && restaurantUsersStore.isRestaurantAdminOf(authStore.userId, cartStore.restaurantId)) {
    localError.value = 'Restaurant administrators cannot place orders for their restaurants.'
    submitting.value = false
    return
  }
  const warning = pickupWarning()
  const order = await ordersStore.placeOrder({
    userId: authStore.userId ?? '',
    restaurantId: cartStore.restaurantId,
    pickupTime: cartStore.pickupTime,
    lines: cartStore.lines,
    totalPrice: cartStore.totalPrice,
  })

  if (!order) {
    submitting.value = false
    return
  }

  if (warning) {
    await ordersStore.changeOrderStatus({ ...order, summary: `${order.summary ?? ''}${warning ? ` ${warning}` : ''}` }, order.orderStatus ?? ORDER_STATUS.pending)
  }

  const payment = await paymentsStore.registerPayment({
    orderId: order.id,
    amount: cartStore.totalPrice,
    paymentMethod: paymentMethod.value,
    paymentStatus: PAYMENT_STATUS.pending,
    paidAt: null,
  })

  if (payment) {
    // Keep the order status as Pending; payment recorded as Pending
    cartStore.clearCart()
    await router.push(`/orders/${order.id}`)
  }

  submitting.value = false
}

onMounted(() => {
  void openingHoursStore.loadOpeningHours()
})
</script>

<template>
  <main class="page">
    <h1>Checkout</h1>
    <section v-if="cartStore.lines.length" class="panel">
      <div class="summary-row"><span>Items</span><strong>{{ cartStore.totalItems }}</strong></div>
      <div class="summary-row"><span>Total</span><strong>${{ cartStore.totalPrice.toFixed(2) }}</strong></div>
      <p v-if="pickupWarning()" class="warning">{{ pickupWarning() }}</p>
      <form class="form" @submit.prevent="submitOrder">
        <label>Pickup time<input v-model="cartStore.pickupTime" type="datetime-local" /></label>
        <label>Payment method<select v-model="paymentMethod"><option>Card</option><option>Cash at pickup</option><option>Gift card</option></select></label>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="submitting">{{ submitting ? 'Confirming...' : 'Confirm order and register payment' }}</button>
      </form>
    </section>
    <section v-else class="panel"><h2>No items to checkout</h2><RouterLink to="/restaurants">Browse restaurants</RouterLink></section>
  </main>
</template>

<style scoped>
.page{max-width:720px;margin:0 auto;padding:1.5rem}.panel{display:grid;gap:1rem;border:1px solid #d8dfd8;border-radius:22px;background:#fff;padding:1rem}.summary-row{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:.6rem}.form{display:grid;gap:.8rem}label{display:grid;gap:.35rem;font-weight:700}input,select{border:1px solid #b8c0cc;border-radius:10px;padding:.55rem;font:inherit}button,a{width:fit-content;border:none;border-radius:999px;background:#164e3f;color:#fff;padding:.65rem .95rem;text-decoration:none;cursor:pointer}button:disabled{opacity:.65;cursor:not-allowed}.error{margin:0;color:#a61b1b}.warning{margin:0;color:#92400e;background:#fef3c7;border-radius:12px;padding:.6rem}
</style>
