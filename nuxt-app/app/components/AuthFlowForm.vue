<script setup lang="ts">
import type { KratosBrowserFlow, KratosUiNode } from "~/types/kratos";

const props = defineProps<{
  flow: KratosBrowserFlow | null;
  flowError: boolean;
  mode: "login" | "registration";
}>();

const isRegistration = computed(() => props.mode === "registration");
const title = computed(() => isRegistration.value ? "Criar conta" : "Entrar");
const submitLabel = computed(() => isRegistration.value ? "Criar conta" : "Entrar");

const fieldLabel = (node: KratosUiNode) => {
  if (node.meta?.label?.text) {
    return node.meta.label.text;
  }

  const labels: Record<string, string> = {
    "traits.email": "E-mail",
    "traits.fullName": "Nome completo",
    password: "Senha",
    identifier: "E-mail",
  };
  return labels[node.attributes.name] ?? node.attributes.name;
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
        <h1>{{ title }}</h1>
      </div>

      <p v-if="flowError" class="form-feedback form-feedback--danger" role="alert">
        Não foi possível carregar esta etapa. O fluxo pode ter expirado; inicie novamente.
      </p>
      <a
        v-if="flowError"
        :href="isRegistration ? '/auth/register' : '/auth/login'"
        class="auth-retry"
      >
        Iniciar novamente
      </a>

      <form
        v-else-if="flow"
        class="login-form"
        :action="flow.ui.action"
        :method="flow.ui.method"
      >
        <p
          v-for="message in flow.ui.messages"
          :key="message.id ?? message.text"
          :class="[
            'form-feedback',
            message.type === 'error' ? 'form-feedback--danger' : 'form-feedback--success',
          ]"
          role="alert"
        >
          {{ message.text }}
        </p>

        <template
          v-for="(node, index) in flow.ui.nodes"
          :key="`${node.attributes.name}-${index}`"
        >
          <input
            v-if="node.type === 'input' && node.attributes.type === 'hidden'"
            :type="node.attributes.type"
            :name="node.attributes.name"
            :value="node.attributes.value"
            :disabled="node.attributes.disabled"
          />

          <label
            v-else-if="node.type === 'input' && node.attributes.type !== 'submit'"
            class="mock-field"
          >
            <span>{{ fieldLabel(node) }}</span>
            <input
              class="mock-input"
              :type="node.attributes.type"
              :name="node.attributes.name"
              :value="node.attributes.value"
              :required="node.attributes.required"
              :disabled="node.attributes.disabled"
              :autocomplete="node.attributes.autocomplete"
              :pattern="node.attributes.pattern"
              :minlength="node.attributes.minlength"
              :maxlength="node.attributes.maxlength"
              :aria-invalid="node.messages?.some((message) => message.type === 'error')"
            />
            <span
              v-for="message in node.messages"
              :key="message.id ?? message.text"
              class="form-feedback form-feedback--danger"
              role="alert"
            >
              {{ message.text }}
            </span>
          </label>

          <button
            v-else-if="node.type === 'input' && node.attributes.type === 'submit'"
            type="submit"
            class="page-shell__cta login-form__submit"
            :name="node.attributes.name"
            :value="node.attributes.value"
            :disabled="node.attributes.disabled"
          >
            <span>{{ node.meta?.label?.text ?? submitLabel }}</span>
          </button>
        </template>
      </form>

      <p v-else class="form-feedback form-feedback--danger" role="status">
        Iniciando o fluxo de autenticação…
      </p>

      <p class="auth-switch">
        <template v-if="isRegistration">
          Já tem uma conta?
          <NuxtLink to="/auth/login">Entrar</NuxtLink>
        </template>
        <template v-else>
          Ainda não tem uma conta?
          <NuxtLink to="/auth/register">Criar conta</NuxtLink>
        </template>
      </p>
    </div>
  </section>
</template>
