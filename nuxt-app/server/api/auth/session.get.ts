import { ensureAppUser } from "~~/server/utils/app-user";
import { fetchKratos } from "~~/server/utils/kratos";

interface KratosSession {
  active: boolean;
  identity?: {
    id?: unknown;
    traits?: {
      email?: unknown;
      fullName?: unknown;
    };
  };
}

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

  const identityId = session.identity.id;
  if (typeof identityId !== "string" || !isUuid(identityId)) {
    throw createError({
      statusCode: 502,
      statusMessage: "Kratos returned an invalid identity.",
    });
  }

  try {
    await ensureAppUser(identityId);
  } catch (cause) {
    console.error(
      "Failed to provision an app user for an authenticated Kratos session.",
      cause instanceof Error ? cause.name : "Unknown error",
    );
    throw createError({
      statusCode: 503,
      statusMessage: "Your application profile could not be initialized.",
    });
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
