export const upstreamRoutes = {
  auth: {
    login: process.env.NUXT_API_AUTH_LOGIN_PATH || "/api/token/obtain-pair/",
    refresh: process.env.NUXT_API_AUTH_REFRESH_PATH || "/api/token/refresh/",
  },
  contractors: "/api/contratantes/",
  launches: "/api/lancamentos/",
  importLaunchXml: "/api/lancamentos/importar-xml/",
} as const;

export const joinApiUrl = (baseUrl: string, path: string) => {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};
