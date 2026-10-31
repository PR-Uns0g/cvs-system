<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useHead({
  title: "Entrar | CVS System",
});
</script>

<template>
  <section class="login-page">
    <div class="login-card">
      <div class="login-card__brand">
        <AppBrandMark />
        <div>
          <strong>CVS System</strong>
          <p>Clareza para acompanhar notas, faturamento e relatórios sem fricção.</p>
        </div>
      </div>

      <div class="login-card__header">
        <h1>Entrar</h1>
        <p>O fluxo de login do Kratos será conectado aqui.</p>
      </div>
    </div>
  </section>
</template>
