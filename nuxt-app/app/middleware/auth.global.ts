export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/auth/login" || to.path === "/auth/register") {
    return;
  }

  const requestFetch = useRequestFetch();
  const session = await requestFetch<{ authenticated: boolean }>("/api/auth/session");

  if (!session.authenticated) {
    return navigateTo("/auth/login");
  }
});
