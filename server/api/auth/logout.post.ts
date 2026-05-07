import { clearAuthCookies } from "../../utils/auth-cookies";

export default defineEventHandler((event) => {
  clearAuthCookies(event);

  return { ok: true };
});
