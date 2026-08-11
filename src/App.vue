<script setup lang="ts">
import AppHeader from '@/components/App-Header.vue'
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <RouterView />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #f1f5fb 100%);
  color: #111827;
}
</style>
