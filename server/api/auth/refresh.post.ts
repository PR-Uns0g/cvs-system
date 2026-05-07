import { getRefreshToken } from "../../utils/auth-cookies";
import { refreshUpstreamAccess } from "../../utils/refresh-upstream-access";
import { getSessionUser } from "../../utils/token-payload";

export default defineEventHandler(async (event) => {
  if (!getRefreshToken(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Refresh token ausente.",
    });
  }

  const access = await refreshUpstreamAccess(event);

  if (!access) {
    throw createError({
      statusCode: 401,
      statusMessage: "Não foi possível renovar a sessão.",
    });
  }

  return {
    user: getSessionUser(access),
  };
});
