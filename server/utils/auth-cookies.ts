import type { H3Event } from "h3";

const accessTokenCookie = "cvs_access_token";
const refreshTokenCookie = "cvs_refresh_token";
const userHintCookie = "cvs_user_hint";

const cookieDefaults = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export const getAccessToken = (event: H3Event) =>
  getCookie(event, accessTokenCookie);

export const getRefreshToken = (event: H3Event) =>
  getCookie(event, refreshTokenCookie);

export const getAuthUserHint = (event: H3Event) => {
  const raw = getCookie(event, userHintCookie);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(raw)) as {
      email?: string;
      name?: string;
    };
  } catch {
    return null;
  }
};

export const setAuthCookies = (
  event: H3Event,
  tokens: { access: string; refresh?: string },
) => {
  // Align with upstream JWT access lifetime (e.g. Django SIMPLE_JWT, typically 60m).
  setCookie(event, accessTokenCookie, tokens.access, {
    ...cookieDefaults,
    maxAge: Number(process.env.NUXT_ACCESS_COOKIE_MAX_AGE) || 60 * 60,
  });

  if (tokens.refresh) {
    setCookie(event, refreshTokenCookie, tokens.refresh, {
      ...cookieDefaults,
      maxAge: 60 * 60 * 24 * 7,
    });
  }
};

export const setAuthUserHint = (
  event: H3Event,
  user: { email?: string; name?: string } | null,
) => {
  if (!user) {
    return;
  }

  setCookie(event, userHintCookie, encodeURIComponent(JSON.stringify(user)), {
    ...cookieDefaults,
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearAuthCookies = (event: H3Event) => {
  deleteCookie(event, accessTokenCookie, { path: "/" });
  deleteCookie(event, refreshTokenCookie, { path: "/" });
  deleteCookie(event, userHintCookie, { path: "/" });
};
