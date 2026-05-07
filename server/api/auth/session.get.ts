import { getAccessToken } from "../../utils/auth-cookies";
import { refreshUpstreamAccess } from "../../utils/refresh-upstream-access";
import { getSessionUser } from "../../utils/token-payload";

export default defineEventHandler(async (event) => {
  const access = getAccessToken(event);
  let user = getSessionUser(access);

  if (!user) {
    const newAccess = await refreshUpstreamAccess(event);
    user = getSessionUser(newAccess ?? undefined);
  }

  return { user: user ?? null };
});
