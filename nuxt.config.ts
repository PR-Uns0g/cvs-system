import process from "node:process";
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
    apiBase:
      process.env.NUXT_API_BASE ||
      "https://sistema-gest-o-financeira.onrender.com",
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api",
    },
  },
  app: {
    head: {
      title: "CVS System",
      meta: [
        {
          name: "description",
          content: "Frontend do sistema de gestão financeira e notas fiscais.",
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
