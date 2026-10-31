import process from "node:process";
import Aura from "@primeuix/themes/aura";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: process.env.NODE_ENV !== "production" },
  modules: [
    "@primevue/nuxt-module",
  ],
  css: [
    "@fontsource-variable/manrope",
    "primeicons/primeicons.css",
    "~/assets/styles/main.css",
  ],
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
