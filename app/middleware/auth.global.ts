export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = new Set(["/login", "/admin"]);
  const { user, fetchSession } = useAuth();

  if (publicRoutes.has(to.path)) {
    if (!user.value) {
      const sessionUser = await fetchSession();

      if (!sessionUser) {
        return;
      }
    }

    return navigateTo("/dashboard");
  }

  if (user.value) {
    return;
  }

  const sessionUser = await fetchSession();

  if (!sessionUser) {
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }
});
