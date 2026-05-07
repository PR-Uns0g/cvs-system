import { setAuthCookies } from "../../utils/auth-cookies";
import { joinApiUrl, upstreamRoutes } from "../../utils/api-routes";
import { getSessionUser } from "../../utils/token-payload";

type LoginResponse = {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
};

export default defineEventHandler(async (event) => {
  const credentials = await readBody<{ email?: string; password?: string }>(
    event,
  );

  if (!credentials.email || !credentials.password) {
    throw createError({
      statusCode: 422,
      statusMessage: "Informe e-mail e senha.",
    });
  }

  const response = await $fetch<LoginResponse>(
    joinApiUrl(useRuntimeConfig().apiBase, upstreamRoutes.auth.login),
    {
      method: "POST",
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    },
  );

  const access = response.access || response.access_token;
  const refresh = response.refresh || response.refresh_token;

  if (!access || !refresh) {
    throw createError({
      statusCode: 502,
      statusMessage: "A API não retornou tokens válidos.",
    });
  }

  setAuthCookies(event, { access, refresh });

  return {
    user: getSessionUser(access),
  };
});
