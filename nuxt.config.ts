import Aura from "@primeuix/themes/aura";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@primevue/nuxt-module"],
  css: [
    "@fontsource-variable/manrope",
    "primeicons/primeicons.css",
    "~/assets/styles/main.css",
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8000/api",
    },
  },
  app: {
    head: {
      title: "CVS System",
      meta: [
        {
          name: "description",
          content: "Frontend do sistema de gestao financeira e notas fiscais.",
        },
      ],
    },
  },
  primevue: {
    options: {
      ripple: true,
      inputVariant: "filled",
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
        },
      },
    },
  },
});
