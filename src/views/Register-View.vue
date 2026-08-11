<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
})

const submitting = ref(false)
const localError = ref<string | null>(null)

async function onSubmit(): Promise<void> {
  localError.value = null

  if (!form.email || !form.password || !form.firstName || !form.lastName) {
    localError.value = 'All fields are required.'
    return
  }

  submitting.value = true
  const ok = await authStore.registerUser({
    email: form.email,
    password: form.password,
    firstname: form.firstName,
    lastname: form.lastName,
  })
  submitting.value = false

  if (!ok) {
    localError.value = authStore.authError ?? 'Registration failed.'
    return
  }

  await router.push('/')
}
</script>

<template>
  <main class="auth-page">
    <section class="card">
      <h1>Register</h1>
      <p class="subtitle">Create a new account for restaurant management.</p>

      <form @submit.prevent="onSubmit" class="stack">
        <label>
          First name
          <input v-model.trim="form.firstName" type="text" autocomplete="given-name" />
        </label>

        <label>
          Last name
          <input v-model.trim="form.lastName" type="text" autocomplete="family-name" />
        </label>

        <label>
          Email
          <input v-model.trim="form.email" type="email" autocomplete="email" />
        </label>

        <label>
          Password
          <input v-model="form.password" type="password" autocomplete="new-password" />
        </label>

        <p v-if="localError" class="error">{{ localError }}</p>

        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="switch-link">
        Already registered?
        <RouterLink to="/login">Login here</RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 80px);
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.card {
  width: min(460px, 100%);
  padding: 1.5rem;
  border: 1px solid #d5d9e2;
  border-radius: 12px;
  background: #ffffff;
}

.subtitle {
  margin: 0.25rem 0 1rem;
  color: #4b5563;
}

.stack {
  display: grid;
  gap: 0.8rem;
}

label {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
}

input {
  border: 1px solid #b8c0cc;
  border-radius: 8px;
  padding: 0.6rem 0.7rem;
  font: inherit;
}

button {
  border: none;
  border-radius: 8px;
  background: #0f4c81;
  color: #fff;
  padding: 0.7rem 0.9rem;
  cursor: pointer;
  font-weight: 600;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  margin: 0;
  color: #a61b1b;
}

.switch-link {
  margin: 1rem 0 0;
}
</style>
