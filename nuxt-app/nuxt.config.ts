import process from "node:process";
import Aura from "@primeuix/themes/aura";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: process.env.NODE_ENV !== "production" },
  modules: ["@primevue/nuxt-module"],
  runtimeConfig: {
    kratosInternalUrl: "http://kratos:4433",
    public: {
      appUrl: "http://localhost:3000",
      kratosBrowserUrl: "http://localhost:4433",
    },
  },
  css: [
    "@fontsource-variable/manrope",
    "primeicons/primeicons.css",
    "~/assets/styles/main.css",
  ],
  app: {
    head: {
      title: "CVS System",
      htmlAttrs: {
        lang: 'pt-BR'
      },
      meta: [
        {
          name: "description",
          content: "Frontend do sistema de gestão financeira e notas fiscais.",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
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
