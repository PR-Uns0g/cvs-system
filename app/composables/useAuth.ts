import type { ApiUser } from "~/types/api";

type LoginCredentials = {
  email: string;
  password: string;
};

export const useAuth = () => {
  const user = useState<ApiUser | null>("auth-user", () => null);
  const authChecked = useState("auth-checked", () => false);

  const isAuthenticated = computed(() => Boolean(user.value));

  const apiFetch = () => useRequestFetch();

  const fetchSession = async () => {
    try {
      const response = await apiFetch()<{ user: ApiUser | null }>(
        "/api/auth/session",
      );
      user.value = response.user;

      return response.user;
    } finally {
      authChecked.value = true;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await apiFetch()<{ user: ApiUser }>("/api/auth/login", {
      method: "POST",
      body: credentials,
    });
    user.value = response.user;
    authChecked.value = true;

    return response.user;
  };

  const logout = async () => {
    await apiFetch()("/api/auth/logout", { method: "POST" });
    user.value = null;
    authChecked.value = true;
    await navigateTo("/login");
  };

  return {
    user,
    authChecked,
    isAuthenticated,
    fetchSession,
    login,
    logout,
  };
};
