export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = new Set(["/login", "/admin"]);
  const { user, authChecked, fetchSession } = useAuth();

  if (!authChecked.value) {
    await fetchSession();
  }

  if (publicRoutes.has(to.path)) {
    if (user.value) {
      return navigateTo("/dashboard");
    }

    return;
  }

  if (!user.value) {
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }
});
