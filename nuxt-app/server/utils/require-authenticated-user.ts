import type { H3Event } from "h3";
import { fetchKratos } from "~~/server/utils/kratos";

interface KratosSession {
  active?: unknown;
  identity?: {
    id?: unknown;
    traits?: {
      email?: unknown;
      fullName?: unknown;
    };
  } | null;
}

export interface AuthenticatedUser {
  id: string;
  fullName: string | null;
  email: string | null;
}

export async function getAuthenticatedUser(
  event: H3Event,
): Promise<AuthenticatedUser | null> {
  const cookie = getRequestHeader(event, "cookie");
  if (!cookie) {
    return null;
  }

  const config = useRuntimeConfig(event);
  const response = await fetchKratos<KratosSession>(
    config.kratosInternalUrl,
    "/sessions/whoami",
    { headers: { cookie } },
  );

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (response.status !== 200 || !response._data) {
    throw createError({
      status: 502,
      statusText: "Bad Gateway",
      message: "Kratos could not verify the session.",
    });
  }

  const session = response._data;
  if (session.active !== true || !session.identity) {
    return null;
  }

  const identityId = session.identity.id;
  if (typeof identityId !== "string" || !isUuid(identityId)) {
    throw createError({
      status: 502,
      statusText: "Bad Gateway",
      message: "Kratos returned an invalid identity.",
    });
  }

  const traits = session.identity.traits;
  return {
    id: identityId,
    fullName: typeof traits?.fullName === "string" ? traits.fullName : null,
    email: typeof traits?.email === "string" ? traits.email : null,
  };
}

export async function requireAuthenticatedUser(
  event: H3Event,
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(event);
  if (!user) {
    throw createError({
      status: 401,
      statusText: "Unauthorized",
      message: "Authentication required.",
    });
  }

  return user;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
