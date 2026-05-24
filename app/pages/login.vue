<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useHead({
  title: "Login | CVS System",
});

const route = useRoute();
const { login } = useAuth();

const credentials = reactive({
  email: "",
  password: "",
});
const isSubmitting = ref(false);
const errorMessage = ref("");

const redirectTarget = computed(() => {
  const redirect = route.query.redirect;
  const value = Array.isArray(redirect) ? redirect[0] : redirect;

  if (typeof value === "string" && value.startsWith("/")) {
    return value;
  }

  return "/dashboard";
});

const submitLogin = async () => {
  errorMessage.value = "";
  isSubmitting.value = true;

  try {
    await login(credentials);
    await navigateTo(redirectTarget.value);
  } catch (error: unknown) {
    errorMessage.value =
      error && typeof error === "object" && "statusMessage" in error
        ? String(error.statusMessage)
        : "Não foi possível autenticar com essas credenciais.";
  } finally {
    isSubmitting.value = false;
  }
};
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
        <p>Acesse com seu e-mail e senha para consultar faturamento, contratantes e relatórios.</p>
      </div>

      <form class="login-form" @submit.prevent="submitLogin">
        <label class="mock-field">
          <span>E-mail</span>
          <input
            v-model.trim="credentials.email"
            class="mock-input"
            type="email"
            autocomplete="email"
            placeholder="você@empresa.com.br"
            required
          />
        </label>
        <label class="mock-field">
          <span>Senha</span>
          <input
            v-model="credentials.password"
            class="mock-input"
            type="password"
            autocomplete="current-password"
            placeholder="Digite sua senha"
            required
          />
        </label>
        <p v-if="errorMessage" class="form-feedback form-feedback--danger">
          {{ errorMessage }}
        </p>
        <button
          type="submit"
          class="page-shell__cta login-form__submit"
          :disabled="isSubmitting"
        >
          <i class="pi pi-sign-in" />
          <span>{{ isSubmitting ? "Entrando..." : "Entrar no sistema" }}</span>
        </button>
      </form>
    </div>
  </section>
</template>
