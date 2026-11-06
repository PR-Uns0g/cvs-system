import type { KratosSession } from "~/types/kratos";
import { fetchKratos } from "~~/server/utils/kratos";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "private, no-store");

  const cookie = getRequestHeader(event, "cookie");
  if (!cookie) {
    return { authenticated: false };
  }

  const config = useRuntimeConfig(event);
  const response = await fetchKratos<KratosSession>(
    config.kratosInternalUrl,
    "/sessions/whoami",
    { headers: { cookie } },
  );

  if (response.status === 401 || response.status === 403) {
    return { authenticated: false };
  }

  if (response.status !== 200 || !response._data) {
    throw createError({
      statusCode: 502,
      statusMessage: "Kratos could not verify the session.",
    });
  }

  const session = response._data;
  if (!session.active || !session.identity) {
    return { authenticated: false };
  }

  const traits = session.identity.traits;
  return {
    authenticated: true,
    user: {
      fullName: typeof traits?.fullName === "string" ? traits.fullName : null,
      email: typeof traits?.email === "string" ? traits.email : null,
    },
  };
});
