import type { ApiUser } from "~/types/api";
import { upstreamRoutes } from "../../utils/api-routes";
import { getAccessToken, getAuthUserHint, setAuthUserHint } from "../../utils/auth-cookies";
import { refreshUpstreamAccess } from "../../utils/refresh-upstream-access";
import { getSessionUser } from "../../utils/token-payload";
import { upstreamFetch } from "../../utils/upstream-fetch";

export default defineEventHandler(async (event) => {
  let access = getAccessToken(event);

  if (!access) {
    const refreshed = await refreshUpstreamAccess(event);
    if (!refreshed) {
      return { user: null };
    }
    access = refreshed;
  }

  try {
    const user = await upstreamFetch<ApiUser>(event, upstreamRoutes.me);
    setAuthUserHint(event, user);
    return { user };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      error.statusCode === 401
    ) {
      return { user: null };
    }

    return { user: getSessionUser(access, getAuthUserHint(event) ?? undefined) };
  }
});
