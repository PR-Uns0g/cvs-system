export default defineNuxtPlugin(async () => {
  const { fetchSession, authChecked } = useAuth();

  if (!authChecked.value) {
    await fetchSession();
  }
});
