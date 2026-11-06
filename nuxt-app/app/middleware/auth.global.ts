import type { AuthSessionResponse } from "~/types/kratos";

export default defineNuxtRouteMiddleware(async (to) => {
  const authSession = useState<AuthSessionResponse>("auth-session", () => ({
    authenticated: false,
  }));

  if (
    to.path === "/auth/login"
    || to.path === "/auth/register"
    || to.path === "/auth/error"
  ) {
    authSession.value = { authenticated: false };
    return;
  }

  const requestFetch = useRequestFetch();
  const session = await requestFetch<AuthSessionResponse>("/api/auth/session");
  authSession.value = session;

  if (!session.authenticated) {
    return navigateTo("/auth/login");
  }
});
