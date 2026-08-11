<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useAddressesStore } from '@/stores/addresses-store'
import { useAuthStore } from '@/stores/auth-store'
import type { Address, AddressCreate, AddressUpdate } from '@/types/address'

const authStore = useAuthStore()
const addressesStore = useAddressesStore()
const editingId = ref<string | null>(null)
const myAddresses = computed(() => authStore.userId ? addressesStore.addressesForUser(authStore.userId) : [])
const form = reactive({ street: '', city: '', postalCode: '', country: '', summary: '' })
const editForm = reactive({ street: '', city: '', postalCode: '', country: '', summary: '' })

function createPayload(source: typeof form): AddressCreate {
  return {
    street: source.street.trim() || null,
    city: source.city.trim() || null,
    postalCode: source.postalCode.trim() || null,
    country: source.country.trim() || null,
    summary: source.summary.trim() || null,
    userId: authStore.userId,
    restaurantId: null,
  }
}

function updatePayload(source: typeof form, id: string): AddressUpdate {
  return {
    id,
    ...createPayload(source),
  }
}

async function submitAddress(): Promise<void> {
  if (!authStore.userId) {
    addressesStore.error = 'Could not identify the logged-in user from the token.'
    return
  }
  await addressesStore.addAddress(createPayload(form))
}

function startEdit(address: Address): void {
  editingId.value = address.id
  editForm.street = address.street ?? ''
  editForm.city = address.city ?? ''
  editForm.postalCode = address.postalCode ?? ''
  editForm.country = address.country ?? ''
  editForm.summary = address.summary ?? ''
}

async function submitEdit(address: Address): Promise<void> {
  const ok = await addressesStore.editAddress(updatePayload(editForm, address.id))
  if (ok) editingId.value = null
}

onMounted(() => {
  void addressesStore.loadAddresses()
})
</script>

<template>
  <main class="page">
    <h1>My addresses</h1>
    <p v-if="addressesStore.error" class="error">{{ addressesStore.error }}</p>
    <section class="panel"><form class="grid" @submit.prevent="submitAddress"><label>Street<input v-model.trim="form.street" type="text" /></label><label>City<input v-model.trim="form.city" type="text" /></label><label>Postal<input v-model.trim="form.postalCode" type="text" /></label><label>Country<input v-model.trim="form.country" type="text" /></label><label>Summary<input v-model.trim="form.summary" type="text" /></label><button type="submit">Add address</button></form></section>
    <section class="panel list"><article v-for="address in myAddresses" :key="address.id" class="row"><form v-if="editingId === address.id" class="inline-form" @submit.prevent="submitEdit(address)"><input v-model.trim="editForm.street" type="text" /><input v-model.trim="editForm.city" type="text" /><input v-model.trim="editForm.postalCode" type="text" /><input v-model.trim="editForm.country" type="text" /><input v-model.trim="editForm.summary" type="text" /><button type="submit">Save</button><button type="button" @click="editingId = null">Cancel</button></form><template v-else><div><strong>{{ address.summary || address.street || 'Address' }}</strong><p>{{ [address.street, address.city, address.postalCode, address.country].filter(Boolean).join(', ') || 'No address details' }}</p></div><div class="actions"><button type="button" @click="startEdit(address)">Edit</button><button type="button" @click="addressesStore.removeAddress(address.id)">Delete</button></div></template></article></section>
  </main>
</template>

<style scoped>
.page{max-width:900px;margin:0 auto;padding:1.5rem}.panel{border:1px solid #d5d9e2;border-radius:12px;background:#fff;padding:1rem;margin-bottom:1rem}.grid{display:grid;gap:.8rem;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}.inline-form{display:flex;gap:.5rem;flex-wrap:wrap}label{display:grid;gap:.35rem}input{border:1px solid #b8c0cc;border-radius:8px;padding:.5rem;font:inherit}button{border:1px solid #0f4c81;border-radius:8px;background:#0f4c81;color:#fff;padding:.45rem .7rem;cursor:pointer}.list{display:grid;gap:.5rem}.row{display:flex;justify-content:space-between;gap:1rem;border:1px solid #e5e7eb;border-radius:8px;padding:.7rem}.row p{margin:.2rem 0;color:#4b5563}.actions{display:flex;gap:.45rem;flex-wrap:wrap}.error{color:#a61b1b}
</style>
