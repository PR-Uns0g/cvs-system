import { ensureAppUser } from "~~/server/utils/app-user";
import { getAuthenticatedUser } from "~~/server/utils/require-authenticated-user";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "private, no-store");

  const user = await getAuthenticatedUser(event);
  if (!user) {
    return { authenticated: false };
  }

  try {
    await ensureAppUser(user.id);
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

  return {
    authenticated: true,
    user: {
      fullName: user.fullName,
      email: user.email,
    },
  };
});
