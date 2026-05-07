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

export const getSessionUser = (token?: string) => {
  const payload = readJwtPayload(token);

  if (!payload) {
    return null;
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
        : undefined;

  const name =
    typeof payload.name === "string"
      ? payload.name
      : typeof payload.username === "string"
        ? payload.username
        : email;

  return {
    email,
    name: name || "Usuário autenticado",
  };
};
