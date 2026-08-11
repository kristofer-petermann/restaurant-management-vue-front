<template>
  <main class="not-authorized">
    <section class="card">
      <p class="eyebrow">Access limited</p>
      <h1>Not authorized</h1>
      <p>You do not have the required role or restaurant membership for this area.</p>
      <RouterLink to="/">Back to home</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.not-authorized {
  min-height: calc(100vh - 80px);
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.card {
  width: min(520px, 100%);
  border: 1px solid #d8dfd8;
  border-radius: 22px;
  background: #fff;
  padding: 1.4rem;
  text-align: center;
}

.eyebrow {
  color: #7a3d13;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.78rem;
}

a {
  display: inline-flex;
  border-radius: 999px;
  background: #164e3f;
  color: #fff;
  padding: 0.6rem 0.9rem;
  text-decoration: none;
  font-weight: 700;
}
</style>
