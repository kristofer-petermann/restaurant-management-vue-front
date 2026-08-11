<template>
  <main class="not-found">
    <h1>Page not found</h1>
    <p>The page you requested does not exist.</p>
    <RouterLink to="/">Go to home</RouterLink>
  </main>
</template>

<style scoped>
.not-found {
  min-height: calc(100vh - 80px);
  display: grid;
  place-content: center;
  gap: 0.5rem;
  text-align: center;
  padding: 1.5rem;
}
</style>
