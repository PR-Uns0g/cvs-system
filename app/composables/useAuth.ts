import type { ApiUser } from "~/types/api";

type LoginCredentials = {
  email: string;
  password: string;
};

export const useAuth = () => {
  const user = useState<ApiUser | null>("auth-user", () => null);

  const isAuthenticated = computed(() => Boolean(user.value));

  const fetchSession = async () => {
    const response = await $fetch<{ user: ApiUser | null }>("/api/auth/session");
    user.value = response.user;

    return response.user;
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await $fetch<{ user: ApiUser }>("/api/auth/login", {
      method: "POST",
      body: credentials,
    });
    user.value = response.user;

    return response.user;
  };

  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;
    await navigateTo("/login");
  };

  return {
    user,
    isAuthenticated,
    fetchSession,
    login,
    logout,
  };
};
