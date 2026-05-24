type JwtPayload = Record<string, unknown>;

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return Buffer.from(padded, "base64").toString("utf8");
};

export const readJwtPayload = (token?: string): JwtPayload | null => {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  } catch {
    return null;
  }
};

const nameFromEmail = (email?: string) => {
  if (!email) {
    return undefined;
  }

  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  if (!local) {
    return email;
  }

  return local.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getSessionUser = (
  token?: string,
  fallback?: { email?: string; name?: string } | string,
) => {
  const payload = readJwtPayload(token);
  const fallbackEmail = typeof fallback === "string" ? fallback : fallback?.email;
  const fallbackName = typeof fallback === "string" ? undefined : fallback?.name;

  if (!payload) {
    return fallbackEmail || fallbackName
      ? {
          email: fallbackEmail,
          name: fallbackName || nameFromEmail(fallbackEmail) || fallbackEmail,
        }
      : null;
  }

  const exp = payload.exp;
  if (typeof exp === "number" && exp * 1000 <= Date.now()) {
    return null;
  }

  const email =
    typeof payload.email === "string"
      ? payload.email
      : typeof payload.user_email === "string"
        ? payload.user_email
        : fallbackEmail;

  const name =
    typeof payload.name === "string"
      ? payload.name
      : typeof payload.username === "string"
        ? payload.username
        : fallbackName || nameFromEmail(email);

  return {
    email,
    name: name || email,
  };
};
