<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useHead({
  title: "Admin | CVS System",
});
</script>

<template>
  <section class="login-page">
    <div class="login-card">
      <div class="login-card__header">
        <h1>Admin</h1>
        <p>O painel administrativo pertence ÃƒÂ  API Django e nÃƒÂ£o ÃƒÂ© servido pelo frontend Nuxt.</p>
      </div>

      <a
        class="page-shell__cta login-form__submit"
        href="https://sistema-gest-o-financeira.onrender.com/admin/"
      >
        <i class="pi pi-external-link" />
        <span>Abrir admin da API</span>
      </a>
    </div>
  </section>
</template>
