<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useHead({
  title: "Erro de autenticação | CVS System",
});

const route = useRoute();
const errorId = typeof route.query.id === "string" ? route.query.id : "";
const { data, error } = await useFetch<{ message: string }>("/api/auth/error", {
  query: { id: errorId },
  key: `kratos-error-${errorId || "missing"}`,
  immediate: Boolean(errorId),
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
        <h1>Não foi possível concluir</h1>
        <p>Ocorreu um erro durante a autenticação.</p>
      </div>

      <p class="form-feedback form-feedback--danger" role="alert">
        {{ data?.message ?? (errorId ? "Não foi possível carregar os detalhes do erro." : "O identificador do erro está ausente.") }}
      </p>

      <nav class="auth-error-actions" aria-label="Ações de autenticação">
        <NuxtLink to="/auth/login" class="page-shell__cta">Ir para login</NuxtLink>
        <NuxtLink to="/auth/register" class="auth-retry">Tentar criar conta novamente</NuxtLink>
      </nav>
    </div>
  </section>
</template>
