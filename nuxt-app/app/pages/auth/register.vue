<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useHead({
  title: "Criar conta | CVS System",
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
        <h1>Criar conta</h1>
        <p>O fluxo de registro do Kratos será conectado aqui.</p>
      </div>
    </div>
  </section>
</template>
