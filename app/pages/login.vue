<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Login | CVS System',
})
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
        <p>Fluxo-base de autenticação previsto no PRD, com foco em leitura simples e ação direta.</p>
      </div>

      <form class="login-form">
        <label class="mock-field">
          <span>E-mail</span>
          <input class="mock-input" type="email" placeholder="voce@empresa.com.br" />
        </label>
        <label class="mock-field">
          <span>Senha</span>
          <input class="mock-input" type="password" placeholder="Digite sua senha" />
        </label>
        <NuxtLink to="/" class="page-shell__cta login-form__submit">
          <i class="pi pi-sign-in" />
          <span>Entrar no sistema</span>
        </NuxtLink>
      </form>
    </div>
  </section>
</template>
