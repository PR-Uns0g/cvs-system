<script setup lang="ts">
import type { KratosBrowserFlow } from "~/types/kratos";

definePageMeta({
  layout: "auth",
});

useHead({
  title: "Entrar | CVS System",
});

const config = useRuntimeConfig();
const route = useRoute();
const flowId = typeof route.query.flow === "string" ? route.query.flow : "";

if (!flowId) {
  const browserUrl = config.public.kratosBrowserUrl.replace(/\/$/, "");
  await navigateTo(`${browserUrl}/self-service/login/browser`, {
    external: true,
    redirectCode: 303,
  });
}

const { data: flow, error } = await useFetch<KratosBrowserFlow>("/api/auth/flow", {
  query: { type: "login", id: flowId },
  key: `kratos-login-${flowId || "new"}`,
  immediate: Boolean(flowId),
});
</script>

<template>
  <AuthFlowForm :flow="flow ?? null" :flow-error="Boolean(error)" mode="login" />
</template>
