import { setAuthCookies, setAuthUserHint } from "../../utils/auth-cookies";
import { joinApiUrl, upstreamRoutes } from "../../utils/api-routes";
import { getSessionUser } from "../../utils/token-payload";
import type { ApiUser } from "~/types/api";

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
    setResponseStatus(event, 422, "Informe e-mail e senha.");
    return {
      user: null,
    };
  }

  let response: LoginResponse;
  try {
    response = await $fetch<LoginResponse>(
      joinApiUrl(useRuntimeConfig().apiBase, upstreamRoutes.auth.login),
      {
        method: "POST",
        body: {
          email: credentials.email,
          password: credentials.password,
        },
      },
    );
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      error.statusCode === 401
    ) {
      setResponseStatus(event, 401, "E-mail ou senha invÃ¡lidos.");
      return {
        user: null,
      };
    }

    setResponseStatus(event, 502, "NÃ£o foi possÃ­vel conectar Ã  API de autenticaÃ§Ã£o.");
    return {
      user: null,
    };
  }

  const access = response.access || response.access_token;
  const refresh = response.refresh || response.refresh_token;

  if (!access || !refresh) {
    throw createError({
      statusCode: 502,
      statusMessage: "A API não retornou tokens válidos.",
    });
  }

  setAuthCookies(event, { access, refresh });

  let user: ApiUser | null = null;
  try {
    user = await $fetch<ApiUser>(
      joinApiUrl(useRuntimeConfig().apiBase, upstreamRoutes.me),
      {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      },
    );
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      ![401, 404].includes(Number(error.statusCode))
    ) {
      throw error;
    }

    user = getSessionUser(access, credentials.email);
  }

  setAuthUserHint(event, user ?? { email: credentials.email });

  return {
    user,
  };
});
